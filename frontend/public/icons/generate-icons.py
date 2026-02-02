from PIL import Image, ImageDraw
import os

sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for size in sizes:
    img = Image.new('RGB', (size, size), color='#0f172a')
    draw = ImageDraw.Draw(img)
    
    # Draw a truck icon (simplified)
    padding = size // 6
    truck_width = size - (2 * padding)
    truck_height = truck_width // 2
    
    y_offset = (size - truck_height) // 2
    
    # Truck body
    body_width = int(truck_width * 0.7)
    draw.rectangle([padding, y_offset, padding + body_width, y_offset + truck_height], fill='#3b82f6')
    
    # Truck cab
    cab_x = padding + body_width
    cab_height = int(truck_height * 0.7)
    cab_y = y_offset + (truck_height - cab_height)
    draw.rectangle([cab_x, cab_y, padding + truck_width, y_offset + truck_height], fill='#60a5fa')
    
    # Wheels
    wheel_radius = truck_height // 5
    wheel_y = y_offset + truck_height - wheel_radius
    draw.ellipse([padding + truck_width//4 - wheel_radius, wheel_y - wheel_radius, 
                  padding + truck_width//4 + wheel_radius, wheel_y + wheel_radius], fill='#1e293b')
    draw.ellipse([padding + int(truck_width*0.85) - wheel_radius, wheel_y - wheel_radius, 
                  padding + int(truck_width*0.85) + wheel_radius, wheel_y + wheel_radius], fill='#1e293b')
    
    img.save(f'icon-{size}x{size}.png')
    print(f'Created icon-{size}x{size}.png')

print('All icons generated!')
