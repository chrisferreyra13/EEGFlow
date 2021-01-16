import React, { useState } from 'react'
import {
  CPagination
} from '@coreui/react'

const PaginationEvent = ({numberOfPages}) => {
  const [currentPage, setCurrentPage] = useState(3)

  return (
    <>
      <h6 align="center">Numero de Evento</h6>
      <CPagination
        align="center"
        activePage={currentPage}
        pages={numberOfPages}
        onActivePageChange={setCurrentPage}
        size='sm'
        dots={false}
      />
    </>
  )
}

export default PaginationEvent
