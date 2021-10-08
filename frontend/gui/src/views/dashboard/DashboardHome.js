import React, { lazy } from 'react'
import {
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CCallout
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {Col, Row} from "reactstrap"

import MainChartExample from '../charts/MainChartExample.js'
import ChartBarSimple from '../charts/ChartBarSimple.js'
const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'))
const WidgetsBrand = lazy(() => import('../widgets/WidgetsBrand.js'))

const DashboardHome = () => {
  return (
    <>
      <h1 className= "title"> MIS PLANTILLAS</h1>
      <CCard>
        <CCardBody>
          <Row>
            <Col sm="5">
              <h4 id="traffic" className="card-title mb-0">Ultimo editado</h4>
            </Col>
          </Row>
              {/*<MainChartExample style={{height: '300px', marginTop: '40px'}}/>*/}
              <img src="images/diagram1.png"/>

        </CCardBody>
        <CCardFooter>
          <CRow className="text-center">
              <CButton color="info">
                Editar
              </CButton>
          </CRow>
        </CCardFooter>
      </CCard>
    </>
  )
}

export default DashboardHome
