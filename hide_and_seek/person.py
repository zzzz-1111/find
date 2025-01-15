import os
import random
import string

# 随机生成 6 位 UID 的函数
def generate_uid():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

# 创建 20 个 HTML 文件
def create_html_files(num_files=20, output_dir="person_pages", template_file="cardtemp.html"):
    # 确保输出目录存在
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 读取 HTML 模板
    with open(template_file, "r", encoding="utf-8") as file:
        html_template = file.readlines()  # 读取为每行一个元素的列表

    # 创建文件
    for _ in range(num_files):
        uid = generate_uid()
        new_content = []

        # 遍历模板中的每一行
        for line in html_template:
            # 如果行以 'skip' 结尾，则不修改该行
            if line.strip().endswith('skip'):
                new_content.append(line)  # 保留原始行
            else:
                # 替换大括号为双大括号
                new_content.append(line.replace("{", "{{").replace("}", "}}"))

        # 用生成的 UID 替换模板中的 {{uid}}
        html_content = ''.join(new_content).format(uid=uid)
        file_path = os.path.join(output_dir, f"{uid}.html")

        # 将生成的 HTML 内容写入文件
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"文件已创建: {file_path}")

# 运行函数生成网页
create_html_files()
