// TODO: FIX
    // Use jQuery to select ID w/ wildcard
    /*
    document.getElementById('edit-field-media-image-0-upload').addEventListener('change', function (event) {
        ProcessImage();
    }, false);
    */

// $(function() {
//     $('input[id*="edit-field-upload-und-0-upload-button"]').change(function() {
//         ProcessImage();
//     });
// });

(function ($) {
    $(function () {
        jQueryObject = $(".form-submit");
        jQueryObject.ajaxSuccess(function(event, XMLHttpRequest, ajaxOptions) {
//          console.log(ajaxOptions);
//          console.log(XMLHttpRequest);
            ProcessImage();
//          r =  $('.image-preview img').attr("src");
//          console.log(r)
        });
    });
})(jQuery);


//jQuery(document).ready(function() {
//    jQuery("button").click(function() {
//        alert('Upload clicked');
//        ProcessImage();
//        console.log("Found an uploaded file");
//    });
//});

// Calls DetectLabels API and provides formatted descriptor of image
function DetectLabels(imageData) {
    AWS.region = 'us-east-1';
    var rekognition = new AWS.Rekognition();
    var params = {
        Image: {
            Bytes: imageData
        },
        MaxLabels: 5,
//        MinConfidence: 95,
    };

    rekognition.detectLabels(params, function(err, data) {
        if (err) console.log(err, err.stack); //oopsie doopsie something went wrong
        else {
            var alt_text = 'Image may contain:'
            for (var i = 0; i < data.Labels.length; i++) {
                alt_text += ' ' + data.Labels[i].Name;
            }
            // TODO: FIX
            // Need to use jQuery to find alt-tag w/ wildcard
            jQuery(document).ready(function() {
                jQuery('input[id*="edit-field-alt-text"]').val(alt_text)
            });
        }
    });
}

// Loads selected image and unencodes image bytes for Rekognition DetectLabels API
function ProcessImage() {
    AnonLog();
    // Find the actual file using JS/jQuery
    // var control = jQuery('input[id*="edit-field-upload-und-0"]');
    // var file = control.files[0];
    var file_url =  jQuery('.image-preview img').attr("src");
    function toDataURL(url) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    toAWS(reader.result);
                }
                reader.readAsDataURL(xhr.response)
            }
        };
        xhr.open('GET', url)
        xhr.responseType = 'blob'
        xhr.send();
    };

    function toAWS(dataURL) {
        var image = null;
        var jpg = true;
        try {
            image = atob(dataURL.split(",")[1]);
        }
        catch (e) {
            jpg = false;
        }
        if (jpg == false) {
            try {
                image = atob(dataURL.split(",")[1]);
            }
            catch (e) {
                alert("Not an image file Rekognition can process");
            }
        }

        var length = image.length;
        imageBytes = new ArrayBuffer(length);
        var ua = new Uint8Array(imageBytes);
        for (var i = 0; i < length; i++) {
            ua[i] = image.charCodeAt(i);
        }

        // Call Rekognition
        DetectLabels(imageBytes);
    };
    toDataURL(file_url);
    //toAWS(toDataURL(file_url));
}

// Provides anonymous log on to AWS services
function AnonLog() {
    // Configure the credentials provider to use your identity pool
    AWS.config.region = 'us-east-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:dfc6890f-a4cf-4c68-9d23-d415dbdb2673',
    });

    // Make the call to obtain credentials
    AWS.config.credentials.get(function () {
        // Credentials will be available when this function is called
        var accessKeyId = AWS.config.credentials.accessKeyId;
        var secretAcessKey = AWS.config.credentials.secretAccessKey;
        var sessionToken = AWS.config.credentials.sessionToken;
    });
}