import React, { useEffect, useRef, useState } from 'react'


export default function FileLoader({ setDensity }: { setDensity: React.Dispatch<React.SetStateAction<Array<number>>> }) {
  const inputFile: React.MutableRefObject<HTMLInputElement> = useRef()
  const onButtonClick = () => {
    // `current` points to the mounted file input element
    inputFile.current.click()
    console.log(inputFile.current.files)
    if (inputFile.current.files.length > 0) {
      const fileObj = inputFile.current.files[0]
      // const objectURL = window.URL.createObjectURL(fileObj)
      const reader = new FileReader()
      reader.readAsText(fileObj)
      reader.onload = () => {
        console.log(reader.result)

        let text = reader.result as string
        const density = text.split(' ').map((val) => parseFloat(val))
        density.pop()
        setDensity(density)

      }
      reader.onerror = () => {
        console.log("error", reader.error)
      }
    }
  }

  return (
    <div>
      <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} />
      <button onClick={onButtonClick}>Open file upload window</button>
    </div>
  )
}
