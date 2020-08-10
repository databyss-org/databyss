/**
 * PDF.js extension that extracts highlighted text and annotations from pdf files.
 * Based on modified version of pdf.js available here https://github.com/jlegewie/pdf.js
 * (see various extract branches). See 'PDF Reference Manual 1.7' section 8.4 for details on 
 * annotations in pdf files.
 */

'use strict';


const SUPPORTED_ANNOTATION_TYPES = ['Text', 'Highlight', 'Underline', 'Stamp'];
const CANVAS_ID = 'pdf-canvas';
const VIEWPORT_SCALE = 1.0;


/**
 * @return {Promise} A promise that is resolved with an Object
 * that includes elements for path, time, and annotations.
 */
PDFJS.getPDFAnnotations = (url, removeHyphens, debug) => {
  // set default values
  removeHyphens = typeof removeHyphens !== 'undefined' ? removeHyphens : true;
  debug = typeof debug !== 'undefined' ? debug : false;
  let legacyPromise = PDFJS.Promise !== undefined;

  // Return a new promise (with support for legacy pdf.js promises)
  /* http://www.html5rocks.com/en/tutorials/es6/promises*/
  const extract = (resolve, reject) => {
    let response = {
      annotations: [],
      time: null,
      url: typeof url == 'string' ? url : ''
    };

    // Fetch the PDF document from the URL using promices
    PDFJS.getDocument(url).then(
      (pdf) => {
        let numPages = pdf.numPages;
        let timeStart = performance.now();

        // function to handle page (render and extract annotations)
        var getAnnotationsFromPage = (page) => {
          const viewport = page.getViewport(VIEWPORT_SCALE);

          // Prepare canvas using PDF page dimensions
          const canvas = document.getElementById(CANVAS_ID);
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          // error handler
          var errorHandler = (error) => {
            // continue with next page
            if (numPages > page.pageNumber) {
              pdf.getPage(page.pageNumber + 1)
                .then(
                  getAnnotationsFromPage,
                  (err) => {
                    legacyPromise ? promise.reject(response) : reject(err);
                  }
                );
            } else {
              const timeEnd = performance.now();
              response.time = timeEnd - timeStart;
              legacyPromise ? promise.resolve(response) : resolve(response);
            }
          };

          // get annotations
          page.getAnnotations().then(
            (annotations) => {
              const numAnnotations = annotations.length;

              // compatibility for old pdf.js version and filter for supported annotations
              annotations = annotations
                .map((anno) => {
                  if (anno.subtype === undefined) anno.subtype = anno.type;
                  return anno;
                })
                .filter((anno) => {
                  return SUPPORTED_ANNOTATION_TYPES.indexOf(anno.subtype) >= 0;
                });

              // skip page if there are no annotations
              if (numAnnotations === 0) {
                if (numPages > page.pageNumber) {
                  pdf.getPage(page.pageNumber + 1).then(
                    getAnnotationsFromPage,
                    (err) => { legacyPromise ? promise.reject(response) : reject(err); }
                  );
                } else {
                  const timeEnd = performance.now();
                  response.time = timeEnd - timeStart;
                  legacyPromise ? promise.resolve(response) : resolve(response);
                }
                return;
              }

              // render page
              let render = page.render(renderContext, annotations);
              if (render.promise !== undefined) {
                render = render.promise;
              }

              render.then(() => {
                // clean markup
                annotations = annotations.map(
                  (anno) => {
                    anno.page = page.pageNumber;

                    if ('color' in anno) {
                      anno.color = convertDeviceRGBtoRGB(anno.color[0], anno.color[1], anno.color[2]);
                    }

                    // clean markup
                    if (anno.markup) {
                      anno.markup = anno.markup
                        .map(function (part) { return part.trim(); })
                        .join(' ').trim()

                        // translate ligatures (e.g. 'ﬁ')
                        .replace('\ufb00', 'ff').replace('\ufb01', 'fi').replace('\ufb02', 'fl')
                        .replace(/\ufb03/g, 'ffi').replace(/\ufb04/g, 'ffl').replace(/\ufb05/g, 'ft')
                        .replace(/\ufb06/g, 'st').replace(/\uFB00/g, 'ff').replace(/\uFB01/g, 'fi')
                        .replace(/\uFB02/g, 'fl').replace(/\u201D/g, '"').replace(/\u201C/g, '"')
                        .replace(/\u2019/g, "'").replace(/\u2018/g, "'").replace(/\u2013/g, '-')
                        .replace(/''/g, '"').replace(/`/g, "'");

                      if (removeHyphens) {
                        anno.markup = anno.markup.replace(/([a-zA-Z])- ([a-zA-Z])/g, '$1$2');
                      }
                    }

                    // clean annotation
                    if (!debug) {
                      delete anno.annotationFlags;
                      delete anno.borderWidth;
                      delete anno.chars;
                      delete anno.hasAppearance;
                      delete anno.markupGeom;
                      delete anno.name;
                      delete anno.quadPoints;
                      delete anno.rect;
                      delete anno.spaceSize;
                    }

                    return anno;
                  }
                );

                // add annotations to return object
                response.annotations.push.apply(response.annotations, annotations);

                // render next page
                if (numPages > page.pageNumber) {
                  pdf.getPage(page.pageNumber + 1).then(
                    getAnnotationsFromPage,
                    (err) => { legacyPromise ? promise.reject(response) : reject(err); }
                  );
                } else {
                  const timeEnd = performance.now();
                  response.time = timeEnd - timeStart;
                  legacyPromise ? promise.resolve(response) : resolve(response);
                }
              }, errorHandler);
            }, errorHandler);
        };

        // Using promise to fetch the page
        pdf.getPage(1).then(
          getAnnotationsFromPage,
          (err) => { console.log('error getting the page:' + err); }
        );

      },
      (err) => {
        console.log('unable to open pdf: ' + err);
        legacyPromise ? promise.reject(response) : reject(err);
      });
  };

  if (legacyPromise) {
    const promise = new PDFJS.Promise();
    extract();
    return promise;
  } else {
    return new Promise(extract);
  }
};

// function to convert deviceRGB to RGB
function convertDeviceRGBtoRGB (dr, dg, db) {
  const r = Math.round(dr * 255);
  const g = Math.round(dg * 255);
  const b = Math.round(db * 255);
  return [r, g, b];
};