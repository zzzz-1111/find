import re
import requests
import os

# 待解析的 HTML 代码
html_content = """
<a href="https://www.picgo.net/image/axas.WKDURd"><img src="https://img.picgo.net/2025/01/09/-2024-10-13-172224ef7d70a77a847fe7.png" alt="axas" border="0"></a>
<a href="https://www.picgo.net/image/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2024-10-21-190947.WKDNyJ"><img src="https://img.picgo.net/2025/01/09/-2024-10-21-190947bf92145a7e672c00.png" alt="屏幕截图 2024 10 21 190947" border="0"></a>
"""

# 下载函数
def download_image(url, save_path):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)
        print(f"图片已成功下载: {save_path}")
    except requests.exceptions.RequestException as e:
        print(f"下载失败: {e}")

# 创建文件夹存储图片
output_folder = "downloaded_images"
os.makedirs(output_folder, exist_ok=True)

# 使用正则表达式提取 alt 和 src
pattern = r'<img src="(.*?)" alt="(.*?)"'
matches = re.findall(pattern, html_content)

for src, alt in matches:
    # 生成文件路径，确保文件名无非法字符
    safe_filename = re.sub(r'[\\/*?:"<>|]', '_', alt) + os.path.splitext(src)[-1]
    save_path = os.path.join(output_folder, safe_filename)

    # 下载图片
    download_image(src, save_path)
    