import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CPagination
} from '@coreui/react'

const Paginations = () => {
  const [currentPage, setCurrentPage] = useState(2)

  return (
    <>
      <CPagination
            activePage={currentPage}
            pages={10}
            onActivePageChange={setCurrentPage}
      />
    </>
  )
}

export default Paginations
