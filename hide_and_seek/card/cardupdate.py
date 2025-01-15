import os

# 从文件名生成 UID 的函数
def generate_uid_from_filename(filename):
    return os.path.splitext(filename)[0]  # 去掉文件扩展名，保留文件名作为 UID

# 创建 HTML 文件
def create_html_files(num_files=30, output_dir="card_pages", template_file="cardtemp.html"):
    # 确保输出目录存在
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 读取 HTML 模板
    with open(template_file, "r", encoding="utf-8") as file:
        html_template = file.readlines()  # 读取为每行一个元素的列表

    # 获取文件名作为 UID
    existing_files = os.listdir(output_dir)
    for filename in existing_files:
        uid = generate_uid_from_filename(filename)  # 根据文件名提取 UID
        new_content = []

        # 遍历模板中的每一行
        for line in html_template:
            # 如果行以 'skip' 结尾，则不修改该行
            if line.strip().endswith('skip'):
                new_content.append(line)  # 保留原始行
            else:
                # 替换大括号为双大括号
                new_content.append(line.replace("{", "{{").replace("}", "}}"))

        # 用文件名生成的 UID 替换模板中的 {{uid}}
        html_content = ''.join(new_content).format(uid=uid)
        file_path = os.path.join(output_dir, f"{uid}.html")

        # 将生成的 HTML 内容写入文件
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"文件已更新: {file_path}")

# 运行函数生成网页
create_html_files()
