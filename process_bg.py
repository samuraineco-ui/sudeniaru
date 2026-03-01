import os
import glob
from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    
    # Background color is #2E8B57 (46, 139, 87)
    # Foreground color is #FFFFFF (255, 255, 255)
    
    for item in data:
        r, g, b, a = item
        # Calculate how close the pixel is to white vs the background
        # using the Red channel as an indicator since it spans from 46 to 255.
        # It's an approximation for anti-aliased edge blending.
        alpha_factor = (r - 46) / (255 - 46)
        
        # Clamp to 0..1
        alpha_factor = max(0.0, min(1.0, alpha_factor))
        
        new_alpha = int(alpha_factor * 255)
        # We output pure white with the calculated alpha
        new_data.append((255, 255, 255, new_alpha))
        
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    files = {
        "/Users/sudeniaru/.gemini/antigravity/brain/d3b50373-17ff-4521-8034-b1a0496d0067/scene_1_sprouts_1772211942312.png": "bg_scene_1.png",
        "/Users/sudeniaru/.gemini/antigravity/brain/d3b50373-17ff-4521-8034-b1a0496d0067/scene_2_grass_1772211956743.png": "bg_scene_2.png",
        "/Users/sudeniaru/.gemini/antigravity/brain/d3b50373-17ff-4521-8034-b1a0496d0067/scene_3_saplings_1772211973041.png": "bg_scene_3.png",
        "/Users/sudeniaru/.gemini/antigravity/brain/d3b50373-17ff-4521-8034-b1a0496d0067/scene_4_trees_1772212009065.png": "bg_scene_4.png",
        "/Users/sudeniaru/.gemini/antigravity/brain/d3b50373-17ff-4521-8034-b1a0496d0067/scene_5_forest_1772212023869.png": "bg_scene_5.png",
    }
    
    for in_path, out_path in files.items():
        print(f"Processing {out_path}...")
        process_image(in_path, out_path)
    print("Done!")
