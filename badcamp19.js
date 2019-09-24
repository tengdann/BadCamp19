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

jQuery(function() {
    jQuery('input[id*="edit-field-upload"]').click(function() {
        ProcessImage();
        console.log("Found a button change");
    });
});

// Calls DetectLabels API and provides formatted descriptor of image
function DetectLabels(imageData) {
    AWS.region = 'us-east-1';
    var rekognition = new AWS.Rekognition();
    var params = {
        Image: {
            Bytes: imageData
        },
        MaxLabels: 5,
        MinConfidence: 95,
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
            jQuery(function() {
                jQuery('input[id*="edit-field-alt-text"]').val(alt_text)
            });
        }
    });
}

// Loads selected image and unencodes image bytes for Rekognition DetectLabels API
function ProcessImage() {
    AnonLog();
    // Find the actual file using JS/jQuery
    var control = jQuery('input[id*="edit-field-upload-und-0-upload-button"]');
    var file = control.files[0];

    // Load base64 encoded image
    var reader = new FileReader();
    reader.onload = (function (theFile) {
        return function (e) {
            var img = document.createElement('img');
            var image = null;
            img.src = e.target.result;
            var jpg = true;
            try {
                image = atob(e.target.result.split("data:image/jpeg;base64,")[1]);
            }
            catch (e) {
                jpg = false;
            }
            if (jpg == false) {
                try {
                    image = atob(e.target.result.split("data:image/png;base64,")[1]);
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
            DetectLabels(imageBytes)
        };
    })(file);
    reader.readasDataURL(file);
}

// Provides anonymous log on to AWS services
function AnonLog() {
    // Configure the credentials provider to use your identity pool
    AWS.config.region = 'us-east-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:d5e199e8-1891-4a1a-b39a-4cf66f8f852c',
    });

    // Make the call to obtain credentials
    AWS.config.credentials.get(function () {
        // Credentials will be available when this function is called
        var accessKeyId = AWS.config.credentials.accessKeyId;
        var secretAcessKey = AWS.config.credentials.secretAccessKey;
        var sessionToken = AWS.config.credentials.sessionToken;
    });
}