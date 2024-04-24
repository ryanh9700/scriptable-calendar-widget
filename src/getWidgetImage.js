let fm = FileManager.iCloud();
const imagePath = fm.joinPath(fm.documentsDirectory() + "/EventWeatherWidget", Script.name() + ".PNG");

let stockImage = await Photos.fromLibrary();

fixImage(stockImage);
Safari.open("scriptable:///run/Events,%20Weather%20Widget");

//give cropping dimensions to stock photo
function fixImage(stockImage) {
    //check if image is valid
    let height = stockImage.size.height;

    if ((height === 1334)) {
        let alert = new Alert();
            alert.title = "1334";
            alert.message = "Unsupported picture dimensions";
            alert.addAction("Ok");
            alert.present();
        return;
    }

    //pixel sizes for iPhone 7 now 14
    let i7 = {
        small: 474,
        medium: 1014,
        large: 1062,
        left: 82,
        right: 622,
        top: 270,
        middle: 858,
        bottom: 1446
    }

    //cropping dimensions for photo
    let crop = {w: "", h: "", x: "", y: ""}

        crop.w = i7.medium;
        crop.h = i7.large;
        crop.x = i7.left;

        //top: widget top of screen
        //middle: widget bottom of screen
        crop.y = i7.top;

    //crop stock photo to fit widget
    let finCrop = cropImage(stockImage, new Rect(crop.x,crop.y,crop.w,crop.h));

    //re-write file in Scriptable folder with cropped image
    fm.writeImage(imagePath,finCrop);
}

//crop stock photo
function cropImage(stockImage,rect) {
       //create draw context
    let draw = new DrawContext();

    //set canvas dimensions
    draw.size = new Size(rect.width, rect.height);

    //location to draw
    let pointDraw = new Point(-rect.x, -rect.y);
    draw.drawImageAtPoint(stockImage, pointDraw)

  return draw.getImage()
}
