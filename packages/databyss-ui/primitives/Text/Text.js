import React from 'react'
import styled from '@emotion/styled'
import styles from './styles'

const Text = styled.div(({ theme }) => styles(theme))
export default ({ children, ...others }) => <Text {...others}>{children}</Text>
