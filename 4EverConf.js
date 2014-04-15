
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
        "name": "DASH-HEVC HD/UHD 30Hz",
        "url": "http://localhost/dash/demoDashNab2014_30Hz/demoDashNab2014_30Hz.mpd",
        "image": "app/img/4Ever/dashevc-live-2s.jpg",
        "representations": [
            "3840x2160@14.5M",
            "3840x2160@11.5M",
            "1920x1080@5.8M",
            "1920x1080@3.6M",
            "1280x720@2.9M",
            "1280x720@1.7M"
        ]
    },
    {
        "name": "DASH-HEVC UHD 60Hz",
        "url": "http://localhost/dash/UHD/dashevc-live-2s/dashevc-live-2s-4k.mpd",
        "image": "app/img/4Ever/dashevc-live-2s.jpg",
        "representations": [
            "3840x2160@18.4M",
            "3840x2160@13.5M",
            "3840x2160@10.6M"
        ]
    },
    {
        "name": "DASH-HEVC HD 60Hz",
        "url": "http://localhost/dash/UHD/dashevc-live-2s/dashevc-live-2s-p60.mpd",
        "image": "app/img/4Ever/dashevc-live-2s.jpg",
        "representations": [
            "1920x1080@7.5M",
            "1920x1080@5.5M",
            "1280x720@3.7M",
            "1280x720@2.7M"
        ]
    },
    {
        "name": "DASH-HEVC UHD/HD 60Hz",
        "url": "http://localhost/dash/UHD/dashevc-live-2s/dashevc-live-2s.mpd",
        "image": "app/img/4Ever/dashevc-live-2s.jpg",
        "representations": [
            "3840x2160@18.4M",
            "3840x2160@13.5M",
            "3840x2160@10.6M",
            "1920x1080@7.5M",
            "1920x1080@5.5M",
            "1280x720@3.7M",
            "1280x720@2.7M"
        ]
    }
];