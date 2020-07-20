# PDF Services | Databyss


## Getting Started

### 1. Install Dependencies

`yarn`

### 2. Start the Service

See the [main project's README](../../README.md) to learn about how to run this project locally.

### 3. Call the Service

Once the service is running, the current route available is `<domain>/api/pdf/parse`.

When running locally, the default would be <http://localhost:5005/api/pdf/parse>.

Currently, the easiest way to `POST` a PDF to this route would be to run the [prototype's front end](https://github.com/databyss-org/annotations-parser-proto/tree/master/www) to be able to easily drag and drop the file into the browser. The results of the parsing will then show in the console.