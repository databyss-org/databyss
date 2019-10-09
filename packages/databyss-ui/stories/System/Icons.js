import React from 'react'
import { View, Icon, Text } from '@databyss-org/ui/primitives'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import ChevronSvg from '@databyss-org/ui/assets/chevron.svg'
import EditSvg from '@databyss-org/ui/assets/edit.svg'
import FilterSvg from '@databyss-org/ui/assets/filter.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Section } from './'

const LabeledIcon = ({ label, sizeVariant, children, color, ...others }) => (
  <View alignItems="center" justifyContent="center" {...others}>
    <Icon sizeVariant={sizeVariant} color={color} flexGrow={1}>
      {children}
    </Icon>
    <Text variant="uiTextSmall">{label}</Text>
  </View>
)

export default () => (
  <Section title="Icons">
    <Grid mb="medium" rowGap="medium" columnGap="medium">
      <LabeledIcon label="Tiny" sizeVariant="tiny">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Small" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Medium" sizeVariant="medium">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Large" sizeVariant="large">
        <SourceSvg />
      </LabeledIcon>
    </Grid>
    <Grid mb="medium" rowGap="medium" columnGap="medium">
      <LabeledIcon label="Default" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Gray 3" color="gray.3" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Blue 2" color="blue.2" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Primary" color="primary.0" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
    </Grid>
    <Grid mb="medium" rowGap="medium" columnGap="medium">
      <LabeledIcon label="Author" sizeVariant="small">
        <AuthorSvg />
      </LabeledIcon>
      <LabeledIcon label="Chevron" sizeVariant="small">
        <ChevronSvg />
      </LabeledIcon>
      <LabeledIcon label="Edit" sizeVariant="small">
        <EditSvg />
      </LabeledIcon>
      <LabeledIcon label="Filter" sizeVariant="small">
        <FilterSvg />
      </LabeledIcon>
      <LabeledIcon label="Page" sizeVariant="small">
        <PageSvg />
      </LabeledIcon>
      <LabeledIcon label="Search" sizeVariant="small">
        <SearchSvg />
      </LabeledIcon>
      <LabeledIcon label="Source" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Topic" sizeVariant="small">
        <TopicSvg />
      </LabeledIcon>
    </Grid>
    <View height={100} width={100}>
      <Icon flexGrow={1}>
        <TopicSvg />
      </Icon>
    </View>
  </Section>
)
