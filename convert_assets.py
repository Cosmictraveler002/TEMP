#!/usr/bin/env python3
"""
Fast Mass Asset Converter for Meet Me Cafe
Converts images (JPG, PNG) to WebP and videos (MP4, MOV) to WebM using multi-core parallelism.
"""

import os
import sys
import time
import argparse
import subprocess
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
from PIL import Image

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
VIDEO_EXTENSIONS = {'.mp4', '.mov', '.m4v', '.mkv', '.avi'}

def convert_single_image(args):
    src_path, dst_path, quality, method = args
    try:
        orig_size = os.path.getsize(src_path)
        with Image.open(src_path) as img:
            # Handle RGBA / transparency or palette
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                img.save(dst_path, 'WEBP', quality=quality, method=method)
            else:
                rgb_img = img.convert('RGB')
                rgb_img.save(dst_path, 'WEBP', quality=quality, method=method)
        
        new_size = os.path.getsize(dst_path)
        savings = orig_size - new_size
        return {
            'success': True,
            'type': 'image',
            'src': str(src_path),
            'dst': str(dst_path),
            'orig_size': orig_size,
            'new_size': new_size,
            'savings': savings,
            'percent': (savings / orig_size * 100) if orig_size > 0 else 0
        }
    except Exception as e:
        return {
            'success': False,
            'type': 'image',
            'src': str(src_path),
            'error': str(e)
        }

def convert_single_video(src_path, dst_path, crf=32):
    try:
        orig_size = os.path.getsize(src_path)
        # Fast two-pass or single-pass CRF 32 with libvpx-vp9 and row-mt for speed
        cmd = [
            'ffmpeg', '-y', '-i', str(src_path),
            '-c:v', 'libvpx-vp9',
            '-crf', str(crf),
            '-b:v', '0',
            '-deadline', 'good',
            '-cpu-used', '4',
            '-row-mt', '1',
            '-threads', '0',
            '-c:a', 'libopus',
            '-b:a', '96k',
            str(dst_path)
        ]
        
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode != 0:
            # Fallback to VP8 if VP9 encounters issues
            fallback_cmd = [
                'ffmpeg', '-y', '-i', str(src_path),
                '-c:v', 'libvpx',
                '-crf', '10',
                '-b:v', '1M',
                '-c:a', 'libvorbis',
                str(dst_path)
            ]
            res = subprocess.run(fallback_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if res.returncode != 0:
                return {
                    'success': False,
                    'type': 'video',
                    'src': str(src_path),
                    'error': res.stderr.decode('utf-8', errors='ignore')
                }
        
        new_size = os.path.getsize(dst_path)
        savings = orig_size - new_size
        return {
            'success': True,
            'type': 'video',
            'src': str(src_path),
            'dst': str(dst_path),
            'orig_size': orig_size,
            'new_size': new_size,
            'savings': savings,
            'percent': (savings / orig_size * 100) if orig_size > 0 else 0
        }
    except Exception as e:
        return {
            'success': False,
            'type': 'video',
            'src': str(src_path),
            'error': str(e)
        }

def find_assets(root_dir, skip_dirs=None):
    if skip_dirs is None:
        skip_dirs = {'.git', 'node_modules', '.gemini', 'brain', '.system_generated'}
    
    images = []
    videos = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter out directories to skip
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        
        for file in filenames:
            ext = Path(file).suffix.lower()
            full_path = Path(dirpath) / file
            if ext in IMAGE_EXTENSIONS:
                images.append(full_path)
            elif ext in VIDEO_EXTENSIONS:
                videos.append(full_path)
                
    return images, videos

def format_bytes(bytes_num):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if abs(bytes_num) < 1024.0:
            return f"{bytes_num:3.1f} {unit}"
        bytes_num /= 1024.0
    return f"{bytes_num:.1f} TB"

def update_code_references(root_dir, update_images=False):
    """
    Updates index.html to add WebM source tag alongside MP4 if present.
    Optionally replaces .jpg/.png references with .webp in HTML/JSON files if matching .webp exists.
    """
    updated_files = []
    
    # 1. Update Video
    index_html = Path(root_dir) / 'index.html'
    if index_html.exists():
        content = index_html.read_text(encoding='utf-8')
        if 'download.mp4' in content and 'download.webm' not in content:
            replacement = '<source src="download.webm" type="video/webm">\n                        <source src="download.mp4" type="video/mp4">'
            content = content.replace('<source src="download.mp4" type="video/mp4">', replacement)
            index_html.write_text(content, encoding='utf-8')
            updated_files.append(str(index_html.name))

    # 2. Update Image references if requested
    if update_images:
        target_files = ['menu.html', 'index.html', 'checkout.html', 'script.js', 'meet_me_menu_schema.json']
        images_dir = Path(root_dir) / 'images'
        available_webps = {f.stem.lower() for f in images_dir.glob('*.webp')}
        
        for fname in target_files:
            fpath = Path(root_dir) / fname
            if not fpath.exists():
                continue
            text = fpath.read_text(encoding='utf-8')
            modified = False
            for ext in ['.jpg', '.jpeg', '.png']:
                for stem in available_webps:
                    old_ref = f"images/{stem}{ext}"
                    new_ref = f"images/{stem}.webp"
                    if old_ref in text:
                        text = text.replace(old_ref, new_ref)
                        modified = True
            if modified:
                fpath.write_text(text, encoding='utf-8')
                updated_files.append(f"{fname} (images -> webp)")
            
    return updated_files

def main():
    parser = argparse.ArgumentParser(description="Mass convert images to WebP and videos to WebM in parallel.")
    parser.add_argument('--dir', default='.', help="Directory to search (default: current directory)")
    parser.add_argument('--quality', type=int, default=82, help="WebP compression quality (default: 82)")
    parser.add_argument('--method', type=int, default=6, help="WebP compression effort 0-6 (default: 6)")
    parser.add_argument('--crf', type=int, default=32, help="Video VP9 CRF value (default: 32)")
    parser.add_argument('--workers', type=int, default=os.cpu_count() or 4, help="Number of parallel worker processes")
    parser.add_argument('--images-only', action='store_true', help="Convert images only")
    parser.add_argument('--videos-only', action='store_true', help="Convert videos only")
    parser.add_argument('--force', action='store_true', help="Re-convert even if output file already exists")
    parser.add_argument('--update-html', action='store_true', help="Auto-update HTML files with WebM video source tags")
    parser.add_argument('--update-images', action='store_true', help="Switch image src references from .jpg/.png to .webp in HTML/JSON")
    args = parser.parse_args()

    root_dir = Path(args.dir).resolve()
    print("=" * 65)
    print(f"🚀 FAST ASSET COMPRESSION TOOL (WebP & WebM)")
    print(f"📁 Target Directory : {root_dir}")
    print(f"⚡ CPU Workers       : {args.workers} cores")
    print(f"🖼️ WebP Quality     : {args.quality} (method {args.method})")
    print(f"🎬 WebM VP9 CRF     : {args.crf}")
    print("=" * 65)

    start_time = time.time()
    images, videos = find_assets(root_dir)

    # 1. Images
    img_tasks = []
    if not args.videos_only:
        for img in images:
            webp_path = img.with_suffix('.webp')
            if not webp_path.exists() or args.force:
                img_tasks.append((img, webp_path, args.quality, args.method))

    print(f"\n📸 Found {len(images)} images ({len(img_tasks)} queued for conversion)")
    
    total_img_orig = 0
    total_img_new = 0
    successful_images = 0

    if img_tasks:
        print(f"⏳ Processing {len(img_tasks)} images across {args.workers} processes...")
        with ProcessPoolExecutor(max_workers=args.workers) as executor:
            futures = [executor.submit(convert_single_image, task) for task in img_tasks]
            for i, future in enumerate(as_completed(futures), 1):
                res = future.result()
                if res['success']:
                    successful_images += 1
                    total_img_orig += res['orig_size']
                    total_img_new += res['new_size']
                    if i % 25 == 0 or i == len(img_tasks):
                        print(f"   [{i}/{len(img_tasks)}] Converted... Saved {format_bytes(total_img_orig - total_img_new)} so far")
                else:
                    print(f"   ⚠️ Error converting {res['src']}: {res.get('error')}")

    # 2. Videos
    total_vid_orig = 0
    total_vid_new = 0
    successful_videos = 0

    if not args.images_only and videos:
        print(f"\n🎬 Found {len(videos)} video(s):")
        for vid in videos:
            webm_path = vid.with_suffix('.webm')
            if not webm_path.exists() or args.force:
                print(f"   Encoding {vid.name} -> {webm_path.name} with VP9...")
                res = convert_single_video(vid, webm_path, crf=args.crf)
                if res['success']:
                    successful_videos += 1
                    total_vid_orig += res['orig_size']
                    total_vid_new += res['new_size']
                    print(f"   ✅ {vid.name}: {format_bytes(res['orig_size'])} -> {format_bytes(res['new_size'])} (Saved {res['percent']:.1f}%)")
                else:
                    print(f"   ⚠️ Video error: {res.get('error')}")
            else:
                print(f"   ⏩ {webm_path.name} already exists (use --force to overwrite)")

    # 3. HTML updates
    if args.update_html or args.update_images:
        updated = update_code_references(root_dir, update_images=args.update_images)
        if updated:
            print(f"\n📝 Updated code references in: {', '.join(updated)}")

    elapsed = time.time() - start_time
    total_orig = total_img_orig + total_vid_orig
    total_new = total_img_new + total_vid_new
    total_saved = total_orig - total_new
    saved_pct = (total_saved / total_orig * 100) if total_orig > 0 else 0

    print("\n" + "=" * 65)
    print("🎉 CONVERSION SUMMARY")
    print(f"⏱️ Time Elapsed      : {elapsed:.2f} seconds")
    print(f"🖼️ Images Converted  : {successful_images}")
    print(f"🎬 Videos Converted  : {successful_videos}")
    if total_orig > 0:
        print(f"📦 Original Size    : {format_bytes(total_orig)}")
        print(f"📉 Compressed Size  : {format_bytes(total_new)}")
        print(f"💰 Total Space Saved: {format_bytes(total_saved)} ({saved_pct:.1f}% reduction!)")
    print("=" * 65)

if __name__ == '__main__':
    main()
