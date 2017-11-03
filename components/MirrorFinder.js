/*global DOMParser, NoVideoFoundException, YouPakMirrorFinder, GenYouTubeMirrorFinder */

/**
 * This component is responsible for finding a video source that works (a mirror)
 * It attempts to do so by making a request to the YouPak website and finding their sources for the video.
 *
 * Inputs:
 *      - A YouTube video url
 *
 * Results:
 *      - Hopefully, we find some video links when calling the function findVideoLinksFromYouPak.
 */

var MirrorFinder;
(function () {
    "use strict";

    MirrorFinder = function () {
        this.genYouTubeMirrorFinder = new GenYouTubeMirrorFinder();
        this.youPakMirrorFinder = new YouPakMirrorFinder();
    };

    MirrorFinder.prototype.findMirrors = function (url, callback) {
        var self = this;

        this.genYouTubeMirrorFinder.findMirrors(url, function (response) {
            console.log("GenYoutube: ");
            console.log(response);

            if (response instanceof Error) {
                // In case of an error in GenYouTube, we will try to get from YouPak
                self.youPakMirrorFinder.findMirrors(url, function (response) {
                    callback(response);
                });
            } else {
                callback(response);
            }
        });
    };

    MirrorFinder.prototype.createRequestToYouPak = function () {
        var request = new XMLHttpRequest();

        request.open("GET", this.url.replace("tube", "pak"), true);

        return request;
    };

    MirrorFinder.prototype.isXMLHttpRequestDone = function (request) {
        // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
        // the number 4 represents DONE (" The operation is complete. ")
        return request.readyState === 4;
    };

    MirrorFinder.prototype.getHTMLDocumentFromText = function (text) {
        return new DOMParser().parseFromString(text, "text/html");
    };

    MirrorFinder.prototype.findVideoLinksFromYouPak = function (responseText) {
        var htmlDoc = this.getHTMLDocumentFromText(responseText),
            videoTag = htmlDoc.getElementsByTagName("video")[0],
            videoSources = videoTag.children;

        if (videoTag === undefined) {
            throw new NoVideoFoundException();
        }

        return Array.prototype.slice.call(videoSources).map(function (element) {
            return element.src;
        });
    };
}());
