# Databyss Changelog

## 2.0.2 - 14 apr, 2021

We've been working hard for the past several months on a complete rewrite of the Databyss data layer that allows you to move transparently between working offline and online. At the same time, we were adding a powerful new feature that lets you organize your notes into collections that can be shared with friends and colleagues.

### Offline-first

Databyss 2.0 automatically saves your notes onto your computer as you type. This means they are always available, even if your internet connection is down. When you're connected to the internet, Databyss continuously syncs with the cloud so your notes are available wherever you login.

### Collections

Invite friends and colleagues into parts of your Databyss by creating collections and sharing them as a URL. You can still share single pages like you did in version 1.0 from the [...] menu in the top right of the page. But now, if you click the Databyss icon in the top left corner, you'll see a new module that lets you create, manage and share groups of pages as collections.

To help you know what pages you have shared, you'll see that single public pages have a yellow icon in the Pages sidebar, while pages included in a public collection have an orange icon.

### Migration notes

All of your pages, topics, and sources should be migrated from your Databyss 1.0. If you notice anything off, please let us know on our Discord (https://discord.gg/jyQVawQM2Q) or at help@databyss.org. One thing to note: our URL structure has changed, so you'll need to re-send your public page links to your friends and colleagues. As noted above, these are easy to find because their icons are highlighted in yellow in the Pages sidebar.

### Bug fixes

There are dozens of bug fixes included in this release. The biggest fix you should notice is that your topics and sources will appear reliably in their respective sidebars as you add them to your pages. Previously, these wouldn't match up until you refreshed your browser.

## 1.x

- Better handling of network availability (#257, #315)
- Back button fix (#258)
- RichTextControl fix (#263)
- Improved search results formatting (#273)
- Improved performance when loading and editing pages (#209)
- Improved search performance (#313)
- Improved inline formatting menu UI (#302, #327)
- Working with line breaks and block breaks is easier now (#310)
- Visual improvements to the editor (#323)
- Text selection improvements (#325)
- Topics and sources hidden if they don't appear on pages (#331)
- Spellcheck performance improved (#342)
