import React from 'react'
import './App.css'

import Grid from './grid'
import FileLoader from './FileLoader'

function App() {
  const [density, setDensity] = React.useState([])
  return (
    <div className="App">
      <FileLoader setDensity={setDensity} />
      <Grid density={density}/>
    </div>
  )
}

export default App

