import os
import qrcode
from PIL import Image, ImageDraw, ImageFont

# 读取目录下的所有 HTML 文件
def process_html_files(directory, prefix, url_base, output_directory):
    # 确保输出目录存在
    os.makedirs(output_directory, exist_ok=True)

    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            # 加上前缀生成新的文件名
            new_filename = f"{prefix}{filename}"
            url = f"{url_base}/{new_filename}"

            # 生成二维码
            qr = qrcode.QRCode(
                version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4
            )
            qr.add_data(url)
            qr.make(fit=True)

            # 创建二维码图片
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_img = qr_img.convert("RGB")

            # 在二维码上方添加文字
            draw = ImageDraw.Draw(qr_img)
            font_size = 50
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except IOError:
                font = ImageFont.load_default()

            text = "card"
            # 使用 textbbox 测量文字大小
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]

            # 创建一个新图片，包含文字和二维码
            img_width = max(qr_img.size[0], text_width)  # 图片宽度取二维码和文字宽度的较大值
            total_height = qr_img.size[1] + text_height + 10  # 上方留出间距
            combined_img = Image.new("RGB", (img_width, total_height), "white")

            # 绘制文字到新图片上方
            draw_combined = ImageDraw.Draw(combined_img)
            text_x = (img_width - text_width) / 2  # 文字居中
            draw_combined.text(
                (text_x, 0), text, fill="black", font=font
            )

            # 将二维码粘贴到新图片下方
            qr_x = (img_width - qr_img.size[0]) // 2  # 二维码居中
            combined_img.paste(qr_img, (qr_x, text_height + 10))

            # 保存图片
            output_path = os.path.join(output_directory, f"{os.path.splitext(new_filename)[0]}.png")
            combined_img.save(output_path)
            print(f"生成二维码: {output_path}")

# 配置路径和参数
html_directory = r".\card_pages"  # 替换为HTML文件所在的目录
prefix = '' # 替换为所需的前缀
url_base = r"https://zzzz-1111.github.io/find/hide_and_seek/card/card_pages/"  # 替换为URL基础地址
output_directory = r"qr_output"  # 替换为二维码输出目录

process_html_files(html_directory, prefix, url_base, output_directory)
