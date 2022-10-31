import moment from 'moment';

export const CII_COLUMNS = [
  {
    title: 'Vessel Name',
    key: 'vesselName',
  },
  {
    title: 'Voyage',
    key: 'voyageId',
  },
  {
    title: 'Predicted or Actual',
    render: (data) => (<>{String(data?.status).toUpperCase()}</>),
  },
  {
    title: 'CO2 Emissions',
    key: 'co2Emissions',
    fixed: true,
  },
  {
    title: 'CII Attained',
    key: 'cii',
    fixed: true,
  },
  {
    title: 'CII Required',
    key: 'ciiRequired',
    fixed: true,
  },
  {
    title: 'CII A/R',
    key: 'ciiRate',
    fixed: true,
  },
  {
    title: 'Category',
    key: 'category',
  },
  {
    title: 'Date',
    render: (data) => (
      <>
        {`${moment(data?.fromDate).format('DD.MM.YYYY')} - ${moment(data?.toDate).format('DD.MM.YYYY')}`}
      </>
    ),
  },
];

export const ETS_COLUMNS = [
  {
    title: 'Vessel Name',
    key: 'vesselName',
  },
  {
    title: 'Voyage',
    key: 'voyageId',
  },
  {
    title: 'Predicted or Actual',
    render: (data) => (<>{String(data?.status).toUpperCase()}</>),
  },
  {
    title: 'CO2 Emissions inbound',
    key: 'co2InboundEu',
    fixed: true,
  },
  {
    title: 'CO2 Emissions outbound',
    key: 'co2OutboundEu',
    fixed: true,
  },
  {
    title: 'CO2 Emissions within EU',
    key: 'co2withinEu',
    fixed: true,
  },
  {
    title: 'CO2 Emissions at Port',
    key: 'co2EuPort',
    fixed: true,
  },
  {
    title: 'CO2 Emissions',
    key: 'totalCo2Emission',
    fixed: true,
  },
  {
    title: 'EUA Cost',
    key: 'euaCost',
    fixed: true,
  },
  {
    title: 'EUA Cost as a % of freight profit',
    key: 'fpPercent',
    fixed: true,
  },
  {
    title: 'EUA Cost as a % of bunkering cost',
    key: 'bcPercent',
    fixed: true,
  },
  {
    title: 'Date',
    render: (data) => `${moment(data?.fromDate).format('DD.MM.YYYY')} - ${moment(data?.toDate).format('DD.MM.YYYY')}`,
  },
];
