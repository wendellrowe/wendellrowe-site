"""Build assets/Wendell-Rowe-Biography.pdf from the site's own fonts and portrait.

Run from the repository root:
    pip install reportlab fonttools brotli pillow
    python tools/build-bio-pdf.py

Keep BIO_PARAGRAPHS in step with bio.html when the biography changes.
This folder is excluded from the deployed site by .assetsignore.
"""
from io import BytesIO
from pathlib import Path
import tempfile

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLTTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Paragraph, Spacer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "Wendell-Rowe-Biography.pdf"

INK = HexColor("#151412")
BODY = HexColor("#3b3935")
MUTED = HexColor("#6f6a61")
GOLD = HexColor("#a8873f")      # print-safe version of the site's #c6a75e
RULE = HexColor("#d8c79f")

BIO_PARAGRAPHS = [
    "Wendell Rowe is an operations and supply chain executive whose career has been built on a simple "
    "principle: turn complexity into execution.",
    "With leadership experience spanning advanced manufacturing, enterprise retail, distribution, and supply "
    "chain, Wendell has spent his career building disciplined systems, developing accountable teams, and "
    "creating operations designed to perform at scale. His approach to leadership is grounded in high "
    "standards, decisive execution, resilience, and the belief that lasting results come from combining "
    "operational excellence with strong people and culture.",
    "Today, Wendell serves as Senior Director of Operations at Applied Materials, bringing decades of "
    "leadership experience to one of the world’s most consequential advanced manufacturing industries. "
    "Previously, he served as Vice President of Operations &amp; Supply Chain at Safeway, adding large-scale "
    "retail and distribution leadership to a career defined by increasingly complex operational responsibility.",
    "Originally from Virginia and now based in Northern California, Wendell’s journey has been shaped by "
    "ambition, reinvention, discipline, and an unwillingness to allow circumstances to define the limits of "
    "what comes next. He carries those lessons into his professional life, his family, and the standards he "
    "sets for himself.",
    "Away from work, Wendell is a husband, father, runner, traveler, and lifelong student of performance and "
    "personal refinement. He approaches life much the same way he approaches operations: eliminate what does "
    "not matter, relentlessly improve what does, and never confuse activity with progress.",
    "For Wendell, success is not simply a title, possession, or destination. It is the ability to build a life "
    "deliberately—to lead well, provide for family, create opportunities for others, remain authentic to "
    "where you came from, and leave behind systems, people, and places stronger than you found them.",
]

AT_A_GLANCE = [
    ("Current", "Senior Director, Operations<br/>Applied Materials"),
    ("Previously", "Vice President, Operations &amp; Supply Chain<br/>Safeway"),
    ("Advisory", "Founder &amp; Managing Principal<br/>Rowe Meridian Group<super>SM</super>"),
    ("Credential", "Six Sigma Green Belt"),
    ("Based", "Northern California"),
]


def register_fonts(tmp: Path) -> None:
    sources = {
        "Cinzel": (ROOT / "assets/fonts/cinzel-latin-wght-normal.woff2", {"Cinzel": 400, "Cinzel-SemiBold": 600}),
        "Inter": (ROOT / "assets/fonts/inter-latin-wght-normal.woff2",
                  {"Inter-Light": 300, "Inter": 400, "Inter-Medium": 500}),
    }
    for _, (src, instances) in sources.items():
        for name, weight in instances.items():
            font = TTFont(src)
            font.flavor = None
            static = instancer.instantiateVariableFont(font, {"wght": weight})
            path = tmp / f"{name}.ttf"
            static.save(path)
            pdfmetrics.registerFont(RLTTFont(name, str(path)))


def portrait_reader() -> ImageReader:
    image = Image.open(ROOT / "assets/portrait-1200.webp").convert("RGB")
    image = image.resize((640, 640), Image.LANCZOS)
    buffer = BytesIO()
    image.save(buffer, "JPEG", quality=86, optimize=True)
    buffer.seek(0)
    return ImageReader(buffer)


def tracked(canvas: Canvas, x: float, y: float, text: str, font: str, size: float, color,
            tracking: float, align: str = "left") -> None:
    """Draw letter-spaced uppercase text, matching the site's tracked labels."""
    width = pdfmetrics.stringWidth(text, font, size) + tracking * (len(text) - 1)
    if align == "right":
        x -= width
    elif align == "center":
        x -= width / 2
    obj = canvas.beginText(x, y)
    obj.setFont(font, size)
    obj.setFillColor(color)
    obj.setCharSpace(tracking)
    obj.textOut(text)
    obj.setCharSpace(0)  # PDF character spacing persists across text objects; reset it
    canvas.drawText(obj)


def flow(frame: Frame, story: list, canvas: Canvas) -> None:
    """Fill a frame from the story, splitting a paragraph across frames when needed."""
    while story:
        if frame.add(story[0], canvas, trySplit=0):
            story.pop(0)
            continue
        parts = frame.split(story[0], canvas)
        if len(parts) < 2 or not frame.add(parts[0], canvas, trySplit=0):
            return
        story[0:1] = parts[1:]
        return


def build() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        register_fonts(Path(tmp))

        W, H = 612, 792
        M = 54
        c = Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
        c.setTitle("Wendell Rowe — Biography")
        c.setAuthor("Wendell Rowe")
        c.setSubject("Executive biography")
        c.setCreator("wendellrowe.com")

        # Header band
        tracked(c, M, H - 50, "MCMLXXV", "Inter-Medium", 7, GOLD, 1.6)
        tracked(c, W - M, H - 50, "OPERATIONS  ·  SCALE  ·  LEGACY", "Inter-Medium", 7, GOLD, 1.6, "right")
        c.setStrokeColor(RULE)
        c.setLineWidth(0.6)
        c.line(M, H - 60, W - M, H - 60)

        # Name block
        tracked(c, M, H - 112, "WENDELL ROWE", "Cinzel-SemiBold", 34, INK, 1.2)
        tracked(c, M, H - 134, "OPERATIONS & SUPPLY CHAIN EXECUTIVE", "Inter-Medium", 8, GOLD, 1.8)

        # Right column: portrait + at a glance
        col_w = 168
        col_x = W - M - col_w - 5  # keep the gold frame inside the right margin
        top = H - 92
        c.drawImage(portrait_reader(), col_x, top - col_w, col_w, col_w)
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.6)
        c.rect(col_x - 5, top - col_w - 5, col_w + 10, col_w + 10)

        label = ParagraphStyle("label", fontName="Inter-Medium", fontSize=6.6, leading=9, textColor=GOLD)
        value = ParagraphStyle("value", fontName="Inter", fontSize=8.6, leading=12, textColor=INK)
        glance = [Paragraph("AT A GLANCE", ParagraphStyle("h", parent=label, fontSize=7, leading=10)),
                  Spacer(1, 10)]
        for key, text in AT_A_GLANCE:
            glance += [Paragraph(key.upper(), label), Paragraph(text, value), Spacer(1, 9)]
        glance_top = top - col_w - 30
        c.setStrokeColor(RULE)
        c.line(col_x - 5, glance_top + 8, col_x + col_w + 5, glance_top + 8)
        split_y = 292  # below this line the text runs the full page width
        Frame(col_x - 5, split_y, col_w + 10, glance_top - split_y, leftPadding=0, rightPadding=0,
              topPadding=4, bottomPadding=0, showBoundary=0).addFromList(glance, c)
        if glance:
            raise SystemExit("At-a-glance column does not fit.")

        # Biography: left column beside the portrait, then full width beneath it
        lede = ParagraphStyle("lede", fontName="Cinzel", fontSize=13, leading=19, textColor=INK, alignment=TA_LEFT)
        body = ParagraphStyle("body", fontName="Inter-Light", fontSize=9.4, leading=14.6, textColor=BODY,
                              spaceAfter=9)
        turn = ParagraphStyle("turn", fontName="Cinzel", fontSize=10.5, leading=15, textColor=GOLD, spaceAfter=8)
        story = [Paragraph(BIO_PARAGRAPHS[0], lede), Spacer(1, 14)]
        story += [Paragraph(p, body) for p in BIO_PARAGRAPHS[1:3]]
        story += [Spacer(1, 2), Paragraph("But the résumé tells only part of the story.", turn)]
        story += [Paragraph(p, body) for p in BIO_PARAGRAPHS[3:]]
        frames = [
            Frame(M, split_y, col_x - 30 - M, H - 158 - split_y, leftPadding=0, rightPadding=0, topPadding=0,
                  bottomPadding=0, showBoundary=0),
            Frame(M, 122, W - 2 * M, split_y - 8 - 122, leftPadding=0, rightPadding=0, topPadding=0,
                  bottomPadding=0, showBoundary=0),
        ]
        for frame in frames:
            flow(frame, story, c)
        if story:
            raise SystemExit("Biography text does not fit on the page; shorten it or adjust the layout.")

        # Closing line
        c.setStrokeColor(GOLD)
        c.line(M, 108, M + 120, 108)
        c.setFont("Cinzel", 13)
        c.setFillColor(INK)
        c.drawString(M, 90, "Self-command is the first victory.")
        c.setFont("Inter-Light", 9)
        c.setFillColor(MUTED)
        c.drawString(M, 77, "Everything else follows.")
        tracked(c, W - M, 77, "BUILD STRENGTH.   CREATE SCALE.   MAKE DECISIONS THAT ENDURE.", "Inter-Medium",
                6.4, GOLD, 1.2, "right")

        # Footer
        c.setStrokeColor(RULE)
        c.line(M, 58, W - M, 58)
        c.setFont("Inter", 7.6)
        c.setFillColor(MUTED)
        c.drawString(M, 43, "wendellrowe.com")
        c.drawCentredString(W / 2, 43, "hello@wendellrowe.com   ·   +1 (415) 580-1835")
        firm = "Rowe Meridian Group"
        fw = pdfmetrics.stringWidth(firm, "Inter", 7.6)
        c.drawString(W - M - fw - 8, 43, firm)
        c.setFont("Inter", 4.6)
        c.drawString(W - M - 7, 46.5, "SM")
        c.linkURL("https://wendellrowe.com", (M, 39, M + 70, 51), relative=0)
        c.linkURL("mailto:hello@wendellrowe.com", (W / 2 - 80, 39, W / 2 + 10, 51), relative=0)

        c.showPage()
        c.save()
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
