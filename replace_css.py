import re

file_path = "css/style.css"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace cake-visual-container and everything up to cake-candle
content = re.sub(
    r'\.cake-visual-container \{.*?\}',
    '.cake-visual-container {\\n  position: relative;\\n  width: 250px;\\n  height: 250px;\\n  margin: 0 auto;\\n  display: flex;\\n  align-items: center;\\n  justify-content: center;\\n}\\n.cake-base-img {\\n  width: 100%;\\n  height: 100%;\\n  object-fit: cover;\\n  border-radius: 50%;\\n  box-shadow: 0 10px 30px rgba(0,0,0,0.2);\\n  transition: filter 0.5s ease;\\n}\\n.cake-overlay-text {\\n  position: absolute;\\n  bottom: 20px;\\n  width: 100%;\\n  text-align: center;\\n  color: #fff;\\n  font-weight: bold;\\n  font-size: 1.2rem;\\n  text-shadow: 1px 1px 4px rgba(0,0,0,0.8);\\n  pointer-events: none;\\n}',
    content,
    flags=re.DOTALL
)

# Remove cake-layer-top, cake-layer-bottom, cake-frosting
content = re.sub(r'\.cake-layer-bottom \{.*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'\.cake-layer-top \{.*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'\.cake-frosting \{.*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'\.cake-frosting::before \{.*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'\.cake-frosting::after \{.*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'\.cake-text \{.*?\}', '', content, flags=re.DOTALL)

# Update cake-candle position to be top center of image
content = re.sub(
    r'\.cake-candle \{.*?\}',
    '.cake-candle {\\n  position: absolute;\\n  top: 10px;\\n  left: 50%;\\n  transform: translateX(-50%);\\n  width: 12px;\\n  height: 40px;\\n  background: repeating-linear-gradient(45deg, #fff, #fff 5px, #e74c3c 5px, #e74c3c 10px);\\n  border-radius: 3px;\\n  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);\\n  z-index: 5;\\n}',
    content,
    flags=re.DOTALL
)

# Update cake-flag-stick position
content = re.sub(
    r'\.cake-flag-stick \{.*?\}',
    '.cake-flag-stick {\\n  position: absolute;\\n  top: 50px;\\n  left: 70%;\\n  width: 4px;\\n  height: 60px;\\n  background: #dcdde1;\\n  transform: translateX(-50%) rotate(5deg);\\n  border-radius: 2px;\\n  z-index: 6;\\n}',
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced CSS.")
