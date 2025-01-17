from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from io import BytesIO

def add_watermark(input_pdf_path, output_pdf_path, watermark_text="个人专属标识"):
    # 注册微软雅黑字体
    pdfmetrics.registerFont(TTFont("MicrosoftYaHei", "msyh.ttc"))  # 确保系统安装了字体文件 "msyh.ttf"
    
    # Read the input PDF
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()
    
    for page_number, page in enumerate(reader.pages):
        # Create a watermark for each page
        packet = BytesIO()
        can = canvas.Canvas(packet, pagesize=letter)
        
        # Calculate position for watermark (middle-top)
        page_width = float(page.mediabox.width)
        page_height = float(page.mediabox.height)
        x = page_width / 2
        y = page_height - 100  # Slightly below the top
        
        # Set font to Microsoft YaHei (微软雅黑)
        can.setFont("MicrosoftYaHei", 40)
        can.setFillColorRGB(0, 0, 0)  # Red color
        can.drawCentredString(x, y, watermark_text)
        can.save()
        
        # Move the watermark to the beginning of the packet
        packet.seek(0)
        watermark_pdf = PdfReader(packet)
        watermark_page = watermark_pdf.pages[0]
        
        # Merge the watermark with the current page
        page.merge_page(watermark_page)
        writer.add_page(page)
    
    # Write the output PDF
    with open(output_pdf_path, "wb") as output_pdf:
        writer.write(output_pdf)

# Example usage
input_pdf_path = "身份标识.pdf"  # Replace with your input PDF path
output_pdf_path = "identification.pdf"  # Replace with desired output PDF path
add_watermark(input_pdf_path, output_pdf_path)
