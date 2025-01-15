import qrcode

def generate_qr_code(url, output_file):
    """
    生成二维码图片并保存到文件。
    
    :param url: 二维码包含的网址
    :param output_file: 输出二维码图片的文件路径
    """
    # 创建二维码对象
    qr = qrcode.QRCode(
        version=1,  # 控制二维码的大小，1 是 21x21 的矩阵
        error_correction=qrcode.constants.ERROR_CORRECT_L,  # 容错等级
        box_size=10,  # 每个“盒子”的像素大小
        border=4,  # 边框宽度（以盒子数计算）
    )
    
    # 添加网址数据
    qr.add_data(url)
    qr.make(fit=True)  # 使二维码适配大小
    
    # 生成二维码图片
    img = qr.make_image(fill_color="black", back_color="white")
    
    # 保存二维码图片
    img.save(output_file)
    print(f"二维码已生成并保存到：{output_file}")

# 使用示例
url = r"https://zzzz-1111.github.io/find/hide_and_seek/card/card_pages/1hx4zp.html"  # 替换为你的网址
output_file = "qrcode.png"  # 保存二维码图片的文件名
generate_qr_code(url, output_file)
