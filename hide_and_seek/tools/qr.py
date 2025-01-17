import qrcode

def generate_qr_code(url, name):
    """
    根据给定的网址和名字生成二维码，并保存为图片文件。

    Args:
        url (str): 要生成二维码的网址。
        name (str): 二维码图片文件的名字（不带扩展名）。

    Returns:
        str: 保存的二维码图片文件路径。
    """
    try:
        # 生成二维码
        qr = qrcode.QRCode(
            version=1,  # 控制二维码的大小，1表示21x21（最小）
            error_correction=qrcode.constants.ERROR_CORRECT_L,  # 容错率
            box_size=10,  # 每个格子的像素大小
            border=4,  # 边框宽度，最小值为4
        )
        qr.add_data(url)  # 添加数据
        qr.make(fit=True)

        # 创建二维码图像
        img = qr.make_image(fill_color="black", back_color="white")

        # 保存图片
        file_name = f"{name}.png"
        img.save(file_name)
        print(f"二维码已生成并保存为: {file_name}")

        return file_name
    except Exception as e:
        print(f"生成二维码时出错: {e}")
        return None

# 示例使用
if __name__ == "__main__":
    website = "https://zzzz-1111.github.io/find/hide_and_seek/check.html"
    filename = "check"
    generate_qr_code(website, filename)
