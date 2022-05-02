import { useBlocks, usePages } from '@databyss-org/data/pouchdb/hooks'
import { DocumentCacheDict } from '@databyss-org/data/pouchdb/interfaces'
import { setTopic as setTopicData } from '@databyss-org/data/pouchdb/topics'
import { setSource as setSourceData } from '@databyss-org/data/pouchdb/sources'
import { setEmbed as setEmbedData } from '@databyss-org/services/embeds'
import React from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import { BlockType, Embed, Source, Topic } from '../interfaces'
import { InlineTypes } from '../interfaces/Range'
import { useSessionContext } from '../session/SessionProvider'
import { updateInlines } from './updateInlines'

interface PropsType {
  children: JSX.Element
}

interface ContextType {
  setTopic: (topic: Topic) => Promise<void>
  setSource: (source: Source) => Promise<void>
  setEmbed: (embed: Embed) => Promise<void>
}

export const IndexContext = createContext<ContextType>(null!)

export const IndexProvider: React.FunctionComponent<PropsType> = ({
  children,
}: PropsType) => {
  const getPublicAccount = useSessionContext((c) => c && c.getPublicAccount)
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const blocksRes = useBlocks(BlockType._ANY, { enabled: !isReadOnly })
  const pagesRes = usePages({ enabled: !isReadOnly })

  const _caches: DocumentCacheDict = {
    blocks: blocksRes.data,
    pages: pagesRes.data,
  }

  const setTopic = async (topic: Topic) => {
    await setTopicData(topic)
    await updateInlines({
      inlineType: InlineTypes.InlineTopic,
      text: topic.text,
      _id: topic._id,
      caches: _caches,
      publicAccount: getPublicAccount(),
    })
  }

  const setSource = async (source: Source) => {
    const name = await setSourceData(source)
    await updateInlines({
      inlineType: InlineTypes.InlineTopic,
      text: name,
      _id: source._id,
      caches: _caches,
      publicAccount: getPublicAccount(),
    })
  }

  const setEmbed = async (embed: Embed) => {
    await setEmbedData(embed)
    await updateInlines({
      inlineType: InlineTypes.Embed,
      text: embed.text,
      _id: embed._id,
      caches: _caches,
      publicAccount: getPublicAccount(),
    })
  }

  return (
    <IndexContext.Provider
      value={{
        setTopic,
        setSource,
        setEmbed,
      }}
    >
      {children}
    </IndexContext.Provider>
  )
}

export const useIndexContext = (
  selector: { (x: ContextType): any } = (x: ContextType) => x
) => useContextSelector(IndexContext, selector)
