# TODOS
* renaming a category does not update the items with the old category name
* additional form validations, such as unacceptable characters in displayName
* refreshing on a private route leads to the login page, need a loader or so for waiting auth0 to respond
* no notification on profile save
* adding a max width for container columns + a min width
* as per the webpack analysis, only 2.5% of the bundle sizes were not from `node_modules`. Overall I'm good with that front for the moment. Lazy loading some routes using Lazy/Suspense resulted in minimal payloads for an app this simple.
