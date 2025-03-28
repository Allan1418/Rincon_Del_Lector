import zipfile

def is_epub_file(file_object):
    try:
        with zipfile.ZipFile(file_object, 'r') as zip_ref:
            if 'mimetype' in zip_ref.namelist():
                with zip_ref.open('mimetype', 'r') as mimetype_file:
                    mimetype_content = mimetype_file.read().decode('utf-8').strip()
                    return mimetype_content == 'application/epub+zip'
            return False
    except zipfile.BadZipFile:
        return False
    except Exception as e:
        #print(f"Ocurrio un error al verificar el archivo: {e}")
        return False

if __name__ == "__main__":
    pass