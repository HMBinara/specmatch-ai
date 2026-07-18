import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_contents: bytes) -> str:
    """
    Extracts all plain text content from uploaded PDF byte stream.
    """
    doc = fitz.open(stream=pdf_contents, filetype="pdf")
    extracted_text = ""
    for page in doc:
        extracted_text += page.get_text()
    doc.close()  # Memory leak නොවෙන්න document එක close කරනවා
    return extracted_text