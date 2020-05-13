import React from 'react'

import Icon from '@databyss-org/ui/primitives/Icon/Icon'

import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import ChevronSvg from '@databyss-org/ui/assets/chevron.svg'
import EditSvg from '@databyss-org/ui/assets/edit.svg'
import FilterSvg from '@databyss-org/ui/assets/filter.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import DatabyssSvg from '@databyss-org/ui/assets/databyss.svg'

const wrapIcon = (Svg, fill, stroke) => props => (
  <Icon fill={fill} stroke={stroke} {...props}>
    <Svg />
  </Icon>
)

const defaultStroke = 2

export const SourceIcon = wrapIcon(SourceSvg, true, 0)
export const AuthorIcon = wrapIcon(AuthorSvg, true, 0)
export const ChevronIcon = wrapIcon(ChevronSvg, true, 0)
export const EditIcon = wrapIcon(EditSvg, true, 0)
export const FilterIcon = wrapIcon(FilterSvg, true, 0)
export const PageIcon = wrapIcon(PageSvg, true, 0)
export const SearchIcon = wrapIcon(SearchSvg, true, 0)
export const TopicIcon = wrapIcon(TopicSvg, true, 0)
export const DatabyssIcon = wrapIcon(DatabyssSvg, true, 0)
export const ArchiveIcon = wrapIcon(ArchiveSvg, false, defaultStroke)
