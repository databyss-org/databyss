import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import Hero from '@databyss-org/ui/modules/Homepage/Hero/Hero'
import HighlightedFeature from '@databyss-org/ui/modules/Homepage/Features/HighlightedFeature'
import imgSourceSelection from '@databyss-org/ui/assets/promo_source_selection.png'
import imgSearchFeature from '@databyss-org/ui/assets/search_feature.png'
import imgMessyNotes from '@databyss-org/ui/assets/messy_notes.jpg'
import pdfVideo from '@databyss-org/ui/assets/pdf_annotations.mp4'
import SourceDropdownSvg from '@databyss-org/ui/assets/source_dropdown.svg'
import { useMediaQuery } from 'react-responsive'
import logo from '@databyss-org/ui/assets/logo_new.png'
import Navbar from '@databyss-org/ui/modules/Homepage/Hero/Navbar'
import backgroundImage from '@databyss-org/ui/assets/stone_bg.jpg'
import Feature from '@databyss-org/ui/modules/Homepage/Features/Feature'
import {
  tabletBreakpoint,
  desktopBreakpoint,
} from '@databyss-org/ui/theming/mediaBreakpoints'
import { pxUnits } from '@databyss-org/ui/theming/views'
import FAQ from '@databyss-org/ui/modules/Homepage/FAQ/FAQ'

const navLinks = [
  { name: 'Home', route: '/' },
  { name: 'Sign Up', route: 'https://app.databyss.org/signup' },
  { name: 'Log in', route: 'https://app.databyss.org/' },
]

const questionsAndAnswers = [
  {
    question: 'At vero eos et accusam et justo duo dolores et ea rebum?',
    answer:
      'Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. ',
  },
  {
    question: 'Ut wisi enim ad minim veniam, quis nostrud exercitation?',
    answer:
      'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt.',
  },
  {
    question: 'Ut wisi enim ad minim veniam, quis nostrud exercitation?',
    answer:
      'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt.',
  },
  {
    question: 'Mauris in egestas ligula. Phasellus euismod nisi tortor?',
    answer:
      'Vestibulum faucibus erat vel dui fermentum rhoncus. Nunc ut lorem quis dui semper vehicula. Praesent sit amet vestibulum lorem. Vestibulum tempor nulla vitae augue vehicula, aliquam venenatis sapien porttitor. Phasellus viverra dignissim eros, nec consequat massa tempus pellentesque.',
  },
]

const Homepage = () => {
  const isTablet = useMediaQuery(tabletBreakpoint)
  const isDesktop = useMediaQuery(desktopBreakpoint)

  const getContentSpacing = () => {
    if (isDesktop) {
      return 'extraLarge'
    }
    if (isTablet) {
      return 'large'
    }
    return 'none'
  }

  return (
    <View minHeight="100vh" width="100%">
      <View
        p="large"
        pb="extraLarge"
        width="100%"
        alignItems="center"
        css={{
          background: `url(${backgroundImage})`,
        }}
      >
        <Navbar navLinks={navLinks} />
        <Hero
          logoSrc={logo}
          title="Databyss"
          headline="You research, dabble, take notes, and get lost in your thoughts. Databyss is your new word-processor."
          buttonText={{ bold: 'Sign up', normal: '(for free)' }}
          buttonHref="https://app.databyss.org/signup"
        />
      </View>
      <HighlightedFeature
        margin={getContentSpacing()}
        imgSrc={imgSourceSelection}
        imgAlt="Interface of the App"
        title="The Basics"
        description="Databyss gives you the freedom to organize notes hierarchically (as a long stream of thought) or to build a network of associations by linking sections of your work to sources, topics, and authors."
      />
      <Feature
        noBg
        videoSrc={pdfVideo}
        imgOnRightSide
        title="Import PDF Annotations"
        description="Drag highlighted and/or annotated PDF files into any Page. Databyss will extract all your margin notes and highlighted passages so you can easily edit and search them."
      />
      <Feature
        svgImg={
          <SourceDropdownSvg
            width={isTablet ? pxUnits(440) : pxUnits(320)}
            height={pxUnits(240)}
          />
        }
        leftBgColor="purple.4"
        rightBgColor="purple.5"
        descriptionColor="text.2"
        title="Add Sources"
        description="To add a new source and find the bibliographical data of the text you are annotating, press @ on a new line to search using Google Books, Cross Ref, and/or Open Library."
      />
      <Feature
        noBg
        imgSrc={imgSearchFeature}
        imgOnRightSide
        title="Global Search"
        description="Tag your entries with source, topic, and/or author. Search through these classifications to find the entries associated with each one. If you click on one of the entries, Databyss will find the exact Page and location where it was entered. You can also search keyword(s) or phrases."
      />
      <Feature
        imgSrc={imgMessyNotes}
        alignContent="flex-start"
        leftBgColor="background.2"
        rightBgColor="background.3"
        descriptionColor="text.2"
        title="About Databyss"
        description={
          <>
            <p>
              Three years ago, I began reading the work of the French
              philosopher Jacques Derrida—commonly referred to as the father of
              deconstruction. I was so enamored with his writing, and felt like
              I was learning so much, that I wanted to make sure I took very
              good notes. So I began by annotating the insides of my books,
              appending page numbers and notes wherever I could find an empty
              space. As I continued reading, I started filling so many blank
              pages that I realized, with dismay, that it was going to be
              extremely hard for me to retrace my steps. How was I possibly
              going to remember which page it was that Derrida discussed
              Justice, Descartes, or the Trace?
            </p>
            <p>
              I decided to transcribe my notes onto a word-processor so that
              they would be searchable. One of the unique things about Derrida’s
              writing is that he will return to the same ideas in many of the
              texts he has written. For example, you often find him talking
              about Justice in a paper that isn’t specifically about Justice. I
              realized that if I wanted to understand what Derrida thinks about
              Justice, it would be quite helpful to organize my notes by concept
              or motif (rather than by source text). I opened up a .pages file
              and started creating these headings as I transcribed my notes. I
              ended up creating 841 motifs/concepts by the end of the process.
              As I transcribed my notes I would copy and paste each one into all
              the motifs that seemed relevant.
            </p>
            <p>
              I could not use Zotero or Mendeley for this type of organization
              because these applications place the organizing buckets,
              specifically the bibliographical material, in the central
              position. You can take notes in these apps, but notes remain
              encumbered within bibliographical buckets. And there is no way to
              read a series of notes one after the other, which was the main
              purpose of organizing the notes the way I did. I needed all the
              bibliographical information there, but I needed it hidden, so that
              I could streamline the process of note-taking and note-reading.{' '}
            </p>
            <p>
              When I finished reading over 100 texts by Derrida, I had written a
              2500 single-spaced .pages document. I was able to search
              motifs/concepts by pressing open apple F, but this was very
              limiting. Additionally, sometimes I wanted to read the notes from
              a single text, but that was utterly impossible. My friend Paul
              solved these problems by developing the website
              returntocinder.com. He compiled my notes so that they could be
              organized by both motif and source text.
            </p>
            <p>
              Databyss combines the simple yet organized style of note-taking I
              developed with the rendering and search capacities of
              returntocinder.com. As I went through the process of organizing my
              notes, I discovered, by way of trial and error, many helpful
              shorthands and stylistic efficiencies that can help other
              researchers. Databyss hopes to make it easy for a user to apply
              all the information necessary to ensure that their notes can be
              traced down in various ways: by motif, by source, by page number,
              by phrase.
            </p>
            <p>——Jake Reeder, Ph.D.</p>
          </>
        }
      />
      <FAQ
        title="FAQ"
        description="Have any doubt? Here you can find the most commonly asked questions"
        marginX={getContentSpacing()}
        questionsAndAnswers={questionsAndAnswers}
      />
    </View>
  )
}

export default Homepage
