# Citation Styles Constants

## Adding a new citation style

1. Go to <https://www.zotero.org/styles> and find the style you wish to add

2. Click on the link for the style and look at the name of the file, e.g. `american-medical-association.csl`.
    - Note down the name without the extension.  
    In the example above, this means `american-medical-association`.
    - No need to save the file, discard the browser modal that popped up.

3. Open `packages/databyss-services/citations/constants/citation-styles.json`.

4. Add a new object in the `styles` array
    - The `id` property *must* be the name of the file from before.  
    In the example above, this means `american-medical-association`.
    - The `url` property *must* be the full path to the file that would have been downloaded before, without the extension.  
    In the example above, this means `https://www.zotero.org/styles/american-medical-association`.  
    - The `name` property is the full name of the citation style.  
    In the example above, this means "American Medical Association 11th edition".
    - The `shortName` property is just that, a short name to refer to this style. This is currently what is presented to users in the citation style drop down menu.  
    In the example above, this means "AMA".
