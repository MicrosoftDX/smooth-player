
// /!\ if you modify thi title don't forget to modify the css rule ".reflected:before"
var pageTitle = "<b>UHDTV</b> in an <b>HTML5</b> browser with <b>DASH-HEVC</b> content adaptation";


// if you want to have multiple lines : add <br> tag :)
var infosTitle = "About this demo";
var infosContent = 
    "•  I want to watch an UltraHD content found on the Internet<br><br>" +
    "•  I take my laptop, my tablet or my connected TV<br><br>" +
    "•  I start my favorite HMTL5 browser<br>   => the video starts without any plugin<br><br>" +
    "•  When the video plays, it automatically adapts to network conditions<br>   => no image freezing";

// maximum 9 streams
var videoStreams = [
    {
        "name": "DASH-HEVC UHD",
        "url": "http://10.194.60.47/orange3s/UHD/dashevc-live-2s/dashevc-live-2s-4k.mpd",
        "image": "app/img/4Ever/dashevc-live-2s.jpg",
        "representations": [
            "3840x2160 - 60 Hz - 18.4 Mbps",
            "3840x2160 - 60 Hz - 13.5 Mbps",
            "3840x2160 - 60 Hz - 10.6 Mbps"
        ]
    },
    {
        "name": "DASH-HEVC HD",
        "url": "http://10.194.60.47/orange3s/UHD/dashevc-live-2s/dashevc-live-2s-p60.mpd",
        "image": "app/img/4Ever/dashevc-live-2s.jpg",
        "representations": [
            "1920x1080 - 60 Hz - 7.5 Mbps",
            "1920x1080 - 60 Hz - 5.5 Mbps",
            "1280x720  - 60 Hz - 3.7 Mbps",
            "1280x720  - 60 Hz - 2.7 Mbps"
        ]
    },
    {
        "name": "DASH-HEVC UHD/HD",
        "url": "http://10.194.60.47/orange3s/UHD/dashevc-live-2s/dashevc-live-2s.mpd",
        "image": "app/img/4Ever/dashevc-live-2s.jpg",
        "representations": [
            "3840x2160 - 60 Hz - 18.4 Mbps",
            "3840x2160 - 60 Hz - 13.5 Mbps",
            "3840x2160 - 60 Hz - 10.6 Mbps",
            "1920x1080 - 60 Hz - 7.5 Mbps",
            "1920x1080 - 60 Hz - 5.5 Mbps",
            "1280x720  - 60 Hz - 3.7 Mbps",
            "1280x720  - 60 Hz - 2.7 Mbps"
        ]
    }
];