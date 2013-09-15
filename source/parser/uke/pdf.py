import sys
import pyPdf

def extract(in_file, coords, out_file):
    with open(in_file, 'rb') as infp:
        reader = pyPdf.PdfFileReader(infp)
        page = reader.getPage(0)
        writer = pyPdf.PdfFileWriter()
        page.mediaBox.lowerLeft = coords[:2]
        page.mediaBox.upperRight = coords[2:]
        # you could do the same for page.trimBox and page.cropBox
        writer.addPage(page)
        with open(out_file, 'wb') as outfp:
            writer.write(outfp)

if __name__ == '__main__':
    in_file = sys.argv[1]
    coords = [int(i) for i in sys.argv[2:6]]
    out_file = sys.argv[6]

    extract(in_file, coords, out_file)
