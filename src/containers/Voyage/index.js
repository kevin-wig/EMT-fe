import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Typography from "@mui/material/Typography";
import Card from '@mui/material/Card';
import moment from 'moment';
import Dropzone from '../../components/Forms/Dropzone';
import BarChart from "../../components/Charts/BarChart";
import LineChart from "../../components/Charts/LineChart";
import StackBarChart from "../../components/Charts/StackBarChart";
import CommonButton from "../../components/Buttons/CommonButton";
import CommonMenu from "../../components/Forms/CommonMenu";
import CommonDatePicker from "../../components/Forms/DatePicker";
import CommonSelect from "../../components/Forms/CommonSelect";
import Modal from "../../components/Modals/Modal";
import DataTable from "../../components/Table/DataTable";
import { newColor } from "../../constants/ChartColors";
import { excelVoyageParse, getVoyageSample } from "../../services/vessel.service";
import MultiaxisChart from '../../components/Charts/MultiaxisChart';

import {
  EXPORT_OPTION,
  EXPORT_OPTIONS,
  FUEL_GRADES,
  JOURNEY_OPTION,
  YEARS_OPTION,
} from "../../constants/Global";
import { COMPANY_EDITOR, SUPER_ADMIN, VIEWER } from "../../constants/UserRoles";
import { useAuth } from "../../context/auth.context";
import { useVessel } from "../../context/vessel.context";
import { useSnackbar } from "../../context/snack.context";
import { useCompany } from "../../context/company.context";
import { download } from "../../utils/download";
import { getScreenShot } from "../../utils/exportAsPdf";
import { CII_COLUMNS, ETS_COLUMNS } from "./constants";

const PREFIX = "vessel-voyage";
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  fileAction: `${PREFIX}-file-action`,
  filterWrapper: `${PREFIX}-filter-wrapper`,
  dataTable: `${PREFIX}-data-table`,
  menu: `${PREFIX}-year-menu`,
  filter: `${PREFIX}-filter`,
  action: `${PREFIX}-action`,
  deleteMsg: `${PREFIX}-deleteMsg`,
  exportAs: `${PREFIX}-export`,
  button: `${PREFIX}-button`,
  importSelect: `${PREFIX}-import-select`,
  toggle: `${PREFIX}-toggle`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.title}`]: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1.5rem",
    marginBottom: "1.5rem",
  },
  [`& .${classes.card}`]: {
    width: "100%",
    boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important",
    padding: "1.5rem",
    marginBottom: "1rem",
  },
  [`& .${classes.fileAction}`]: {
    marginTop: "1rem",
    display: "flex",
    justifyContent: "space-between",
  },
  [`& .${classes.menu}`]: {
    marginRight: "1rem",
  },
  [`& .${classes.filterWrapper}`]: {
    display: "flex",
    flexWrap: "wrap",
  },
  [`& .${classes.dataTable}`]: {
    marginTop: 24,
  },
  [`& .${classes.filter}`]: {
    marginRight: theme.spacing(2),
    // marginBottom: theme.spacing(2),
    minWidth: "150px",
  },
  [`& .${classes.importSelect}`]: {
    marginRight: theme.spacing(1),
    minWidth: "100px",
  },
  [`& .${classes.exportAs}`]: {
    marginLeft: "auto",
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.button}`]: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.action}`]: {
    height: "2rem",
    minWidth: "2rem",
    padding: "0",
    borderRadius: "50%",
    color: theme.palette.surface[0],
    "&:not(:last-of-type)": {
      marginRight: "0.5rem !important",
    },
    "&.view": {
      background: theme.palette.primary.main,
    },
    "&.delete": {
      background: theme.palette.error.main,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: "0 !important",
      marginRight: "1.5rem !important",
      order: "1 !important",
    },
  },
  [`& .${classes.toggle}`]: {
    marginRight: "0.5rem",
  },
}));

const DeleteMsg = styled("p")(() => ({
  [`&.${classes.deleteMsg}`]: {
    margin: 0,
    fontSize: "1rem",
  },
}));

const Voyage = () => {
  const { me } = useAuth();
  const {
    vessels,
    getVessels,
    getTrips,
    removeVesselTrip,
    exportVoyageAsExcel,
    exportVoyageAsPdf,
    getVoyageCIIChart,
    getVoyageStackChart,
    getVoyageETSChart,
    getVoyageETSEuaCostChart,
    getVoyageETSEuaPercentChart,
    getVesselFuelChartPerVoyage,
    createVesselTrips,
  } = useVessel();
  const { notify } = useSnackbar();
  const { companies, getCompanies } = useCompany();

  const history = useHistory();

  const [selectedTab, setSelectedTab] = useState(JOURNEY_OPTION.CII);
  const [companyId, setCompany] = useState(-1);
  const [vesselId, setVesselId] = useState(-1);
  const [trips, setTrips] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState();
  const [order, setOrder] = useState("DESC");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [deletingVoyage, setDeletingVoyage] = useState();
  /* eslint-disable no-unused-vars */
  const [ciiPerVoyage, setCiiPerVoyage] = useState([]);
  const [ciiPerTrip, setCiiPerTrip] = useState([]);
  const [stackChartData, setStackChartData] = useState([]);
  const [costChartPerVoyage, setCostChartPerVoyage] = useState();
  const [etsChartPerVoyage, setEtsChartPerVoyage] = useState();
  const [fuelChartData, setFuelChartData] = useState([]);
  const [euaPercentChart, setEuaPercentChart] = useState();
  const [voyageType, setVoyageType] = useState("VISIABLE");
  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [year, setYear] = useState('no_year');
  const filterParams = useMemo(
    () => ({
      order,
      sortBy,
      page,
      limit,
      search,
      voyageType: voyageType === 'VISIABLE' ? ["PREDICTED", "ACTUAL", "ARCHIVED"] : [voyageType],
      journeyType: selectedTab,
      ...(+vesselId !== -1 && { vesselId }),
      ...(+companyId !== -1 && { companyId }),
      fromDate: year === 'no_year' ? fromDate?.toISOString() : moment(year, 'year').startOf('year').toISOString(),
      toDate: year === 'no_year' ? toDate?.toISOString() : moment(year, 'year').endOf('year').toISOString()
    }),
    [
      order,
      sortBy,
      page,
      limit,
      search,
      voyageType,
      selectedTab,
      vesselId,
      companyId,
      fromDate,
      toDate,
      year
    ]
  );

  const getCIIData = useCallback(
    (filterParams) => {
      getVoyageCIIChart(filterParams).then((res) => {
        setCiiPerVoyage(res.data);
      });

      getVoyageStackChart(filterParams).then((res) => {
        setStackChartData(res.data);
      });

      getVoyageCIIChart(filterParams, "TRIP").then((res) => {
        setCiiPerTrip(res.data);
      });
      
      getVesselFuelChartPerVoyage(filterParams.vesselId, filterParams.fromDate, filterParams.toDate).then((res) => {
        setFuelChartData(res.data);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getVoyageCIIChart]
  );

  const getETSData = useCallback(
    (filterParams) => {
      getVoyageETSChart(filterParams).then((res) => {
        setEtsChartPerVoyage(res.data);
      });
      getVoyageETSEuaCostChart(filterParams).then((res) => {
        setCostChartPerVoyage(res.data);
      });
      getVoyageETSEuaPercentChart(filterParams).then((res) => {
        setEuaPercentChart(res.data);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getVoyageCIIChart]
  );

  const companyFilters = useMemo(() => {
    const all = { name: "All companies", id: -1 };
    if (companies?.length > 0) {
      companies.sort((a, b) => a.name.localeCompare(b.name))
      return [all, ...companies];
    } else {
      return [all];
    }
  }, [companies]);

  const vesselFilters = useMemo(() => {
    const all = { name: "All vessels", id: -1 };
    if (vessels?.length > 0) {
      vessels.sort((a, b) => a.name.localeCompare(b.name))
      if (history.location.state) {
        setVesselId(history.location.state)
      }
      else {
        setVesselId(vessels[0].id)
      }
      return [all, ...vessels];
    } else {
      return [all];
    }
  }, [vessels]);

  const fetchVesselTripsList = useCallback(() => {
    getTrips(filterParams)
      .then((res) => {
        const data = res.data;
        setTrips(data.listData);
        setPagination(data.pagination);
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, "error");
        }
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  useEffect(() => {
    if (me?.userRole?.role === SUPER_ADMIN) {
      getCompanies();
    }

    getVessels(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchVesselTripsList();
  }, [fetchVesselTripsList]);

  useEffect(() => {
    if (selectedTab === JOURNEY_OPTION.CII) {
      getCIIData(filterParams);
    } else if (selectedTab === JOURNEY_OPTION.ETS) {
      getETSData(filterParams);
    }
  }, [filterParams, getCIIData, getETSData, selectedTab]);

  const getLine = useCallback(
    (label, bgColor, colorIndex, data, borderDash, color = null) => ({
      label: label,
      fill: true,
      backgroundColor: bgColor,
      borderColor: color === null ? newColor(colorIndex) : color,
      pointRadius: 5,
      pointBackgroundColor: color === null ? newColor(colorIndex) : color,
      ...(borderDash && { borderDash: [4, 4] }),
      data,
    }),
    []
  );

  const ciiChartPerVoyage = useMemo(() => {
    const ciiLabels = ciiPerTrip.map((voyage) => `${voyage.voyageId}`);
    const ciiLabelsAndIds = ciiPerTrip.map(voyage => ({ voyageId: voyage.voyageId, id: voyage.id }))

    let emissionSum = 0;
    let distanceSum = 0;

    const calculatedCiiPerTrip = [...ciiPerTrip]
    calculatedCiiPerTrip.map((voyage, index) => {
      if (voyage.vesselId !== ciiPerTrip[index - 1]?.vesselId) {
        emissionSum = 0;
        distanceSum = 0;
      }

      emissionSum += parseFloat(voyage.emissions) || 0;
      distanceSum += parseFloat(voyage.distance) || 0;

      return voyage.calculatedCii = (1000000 * emissionSum) / distanceSum / voyage.dwt;
    })

    const actualPoints = calculatedCiiPerTrip.filter(q => q.voyageType === "ACTUAL").map(item => ({ id: item.id, calculatedCii: item.calculatedCii || null, requiredCII: item.requiredCII || null }))
    const actualPointIds = actualPoints.map(item => item.id)

    const predictedPoints = calculatedCiiPerTrip.filter(q => q.voyageType === "PREDICTED" && !actualPointIds.includes(q.id)).map(item => ({ id: item.id, calculatedCii: item.calculatedCii || null, requiredCII: item.requiredCII || null , cii: item.cii || null }))

    const actualPointsToUse = [...actualPoints];

    if (predictedPoints.length !== 0) {
      actualPointsToUse.push(predictedPoints[0]);
    }

    return {
      labels: ciiLabels,
      categories: ciiPerTrip.map((voyage) => `${voyage.category}`),
      datasets: [
        {
          label: "CII attained / CII required ACTUAL(accumulated)",
          fill: true,
          backgroundColor: "transparent",
          borderColor: newColor(0),
          pointRadius: 5,
          pointBackgroundColor: newColor(0),
          data: ciiLabelsAndIds.map(
            ({ id }) =>
              Math.round(actualPointsToUse.find((voyage) => voyage.id === id)
              ?.calculatedCii / actualPointsToUse.find((voyage) => voyage.id === id)?.requiredCII * 1000) / 1000
          ),
        },
        {
          label: "CII attained / CII required PREDICTED(accumulated)",
          fill: true,
          backgroundColor: "transparent",
          borderColor: "#C300CA",
          pointRadius: 5,
          pointBackgroundColor: "#C300CA",
          data: ciiLabelsAndIds.map(
            ({ id }) =>
              Math.round(predictedPoints.find((voyage) => voyage.id === id)
              ?.calculatedCii / predictedPoints.find((voyage) => voyage.id === id)?.requiredCII * 1000) / 1000 || null
          ),
        },
        {
          label: "CII attained / CII required PREDICTED(voyage)",
          fill: true,
          backgroundColor: "transparent",
          borderColor: "#ff748c",
          pointRadius: 5,
          pointBackgroundColor: "#ff748c",
          data: ciiLabelsAndIds.map(
            ({ id }) =>
              Math.round(predictedPoints.find((voyage) => voyage.id === id)
              ?.cii / predictedPoints.find((voyage) => voyage.id === id)?.requiredCII * 1000) / 1000 || null
          ),
        },
        // getLine(
        //   "CII required",
        //   "transparent",
        //   1,
        //   ciiPerTrip.map((voyage) => parseFloat(voyage.requiredCII)?.toFixed(3) || null),
        //   true
        // ),
        getLine(
          "A-bound",
          "rgba(240,240,240,0.3)",
          2,
          ciiPerTrip.map((voyage) => parseFloat(voyage.aBound / voyage.requiredCII)?.toFixed(3) || null),
          true
        ),
        getLine(
          "B-bound",
          "rgba(240,240,240,0.3)",
          3,
          ciiPerTrip.map((voyage) => parseFloat(voyage.bBound / voyage.requiredCII)?.toFixed(3) || null),
          true
        ),
        getLine(
          "C-bound",
          "rgba(240,240,240,0.3)",
          4,
          ciiPerTrip.map((voyage) => parseFloat(voyage.cBound / voyage.requiredCII)?.toFixed(3) || null),
          true,
          "#1145A5"
        ),
        getLine(
          "D-bound",
          "rgba(240,240,240,0.3)",
          5,
          ciiPerTrip.map((voyage) => parseFloat(voyage.dBound / voyage.requiredCII)?.toFixed(3) || null),
          true
        ),
      ],
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciiPerTrip]);
  // }, [ciiPerVoyage]);

  const ciiChartPerTrip = useMemo(() => {
    const ciiLabels = ciiPerTrip.map((voyage) => `${voyage.voyageId}`);

    return {
      labels: ciiLabels,
      categories: ciiPerTrip.map((voyage) => `${voyage.category}`),
      datasets: [
        getLine(
          "CII attained / CII required",
          "transparent",
          0,
          ciiPerTrip.map((voyage) => parseFloat(voyage.cii / voyage.requiredCII)?.toFixed(3) || null)
        ),
        getLine(
          "A-bound",
          "rgba(240,240,240,0.3)",
          2,
          ciiPerTrip.map((voyage) => parseFloat(voyage.aBound / voyage.requiredCII)?.toFixed(3) || null),
          true
        ),
        getLine(
          "B-bound",
          "rgba(240,240,240,0.3)",
          3,
          ciiPerTrip.map((voyage) => parseFloat(voyage.bBound / voyage.requiredCII)?.toFixed(3) || null),
          true
        ),
        getLine(
          "C-bound",
          "rgba(240,240,240,0.3)",
          4,
          ciiPerTrip.map((voyage) => parseFloat(voyage.cBound / voyage.requiredCII)?.toFixed(3) || null),
          true,
          "#1145A5"
        ),
        getLine(
          "D-bound",
          "rgba(240,240,240,0.3)",
          5,
          ciiPerTrip.map((voyage) => parseFloat(voyage.dBound / voyage.requiredCII)?.toFixed(3) || null),
          true
        ),
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciiPerTrip]);

  const stackChartPerVoyage = useMemo(() => {
    const fuels = stackChartData.reduce((allFuels, voyage) => {
      const { voyageId, distanceTraveled, ...fuelEmissions } = voyage;
      Object.entries(fuelEmissions)
        .filter((fe) => fe[1] > 0)
        .forEach((fuel) => {
          if (allFuels.indexOf(fuel[0]) === -1) allFuels.push(fuel[0]);
        });
      return allFuels;
    }, []);

    return {
      labels: stackChartData.map((voyage) => voyage.voyageId),
      datasets: [
        {
          type: "line",
          label: "Distance travelled in NM",
          data: stackChartData.map((voyage) => parseFloat(voyage.distanceTraveled)?.toFixed(3)),
          fill: true,
          backgroundColor: "transparent",
          borderColor: "#777",
          borderDash: [4, 4],
          pointRadius: 5,
          pointBackgroundColor: "#777",
          pointBorderColor: "#777",
          pointHoverBackgroundColor: "#777",
          yAxisID: 'y-axis-2',
        },
        ...fuels.map((fuel, index) => ({
          label: FUEL_GRADES.find((f) => f.value.toLowerCase() === fuel)?.label,
          backgroundColor: newColor(index),
          borderColor: newColor(index),
          data: stackChartData.map((voyage) => parseFloat(voyage[fuel.toLowerCase()])?.toFixed(3)),
          yAxisID: 'y-axis-1',
        })),
      ],
    };
  }, [stackChartData]);

  const costPerVoyage = useMemo(() => {
    if (costChartPerVoyage) {
      const labels = [
        ...costChartPerVoyage.actual.map((voyage) => voyage.key),
        ...costChartPerVoyage.predicted.map((voyage) => voyage.key),
      ];
      return {
        labels: labels.map((label) => label),
        datasets: [
          {
            label: "Actual",
            backgroundColor: newColor(0),
            data: labels.map(
              (key) =>
                parseFloat(costChartPerVoyage.actual.find((voyage) => voyage.key === key)
                  ?.euaCost)?.toFixed(3)
            ),
            barPercentage: 1,
            categoryPercentage: 1,
          },
          {
            label: "Predicted",
            backgroundColor: "#C300CA",
            data: labels.map(
              (key) =>
              parseFloat(costChartPerVoyage.predicted.find(
                  (voyage) => voyage.key === key
                )?.euaCost)?.toFixed(3)
            ),
            barPercentage: 1,
            categoryPercentage: 0.5,
          },
        ],
      };
    }
    return { labels: [], datasets: [] };
  }, [costChartPerVoyage]);

  const cumulativeEuaPerVoyage = useMemo(() => {
    if (costChartPerVoyage) {
      const labels = [
        ...costChartPerVoyage.actual.map((voyage) => voyage.key),
        ...costChartPerVoyage.predicted.map((voyage) => voyage.key),
      ];
      return {
        labels: labels.map((label) => label),
        datasets: [
          {
            label: "Actual",
            fill: true,
            backgroundColor: "transparent",
            borderColor: newColor(0),
            pointRadius: 5,
            pointBackgroundColor: newColor(0),
            data: labels.map(
              (
                (sum) => (key) =>
                  parseFloat(sum += costChartPerVoyage.actual.find(
                    (voyage) => voyage.key === key
                  )?.euaCost)?.toFixed(3)
              )(0)
            ),
          },
          {
            label: "Predicted",
            fill: true,
            backgroundColor: "transparent",
            borderColor: "#C300CA",
            pointRadius: 5,
            pointBackgroundColor: "#C300CA",
            data: labels.map(
              (
                (sum) => (key) =>
                  parseFloat(sum += costChartPerVoyage.predicted.find(
                    (voyage) => voyage.key === key
                  )?.euaCost)?.toFixed(3)
              )(0)
            ),
          },
        ],
      };
    }
    return { labels: [], datasets: [] };
  }, [costChartPerVoyage]);

  const percentPerVoyage = useMemo(() => {
    if (euaPercentChart) {
      return {
        labels: euaPercentChart.map((voyage) => voyage.key),
        datasets: [
          {
            label: "EUA Cost as % of Bunker Cost",
            fill: true,
            backgroundColor: "transparent",
            borderColor: "#247aff",
            pointBackgroundColor: "#247aff",
            pointRadius: 5,
            data: euaPercentChart.map((voyage) => parseFloat(voyage.bcPercent)?.toFixed(3)),
          },
          {
            label: "EUA Cost as % of Company's Fares",
            fill: true,
            backgroundColor: "transparent",
            borderColor: "#C300CA",
            pointBackgroundColor: "#C300CA",
            pointRadius: 5,
            data: euaPercentChart.map((voyage) => parseFloat(voyage.fpPercent)?.toFixed(3)),
          },
        ],
      };
    }
    return { labels: [], datasets: [] };
  }, [euaPercentChart]);

  const fuelChartPerVoyage = useMemo(() => {
    const fuels = fuelChartData.reduce((allFuels, voyage) => {
      const { voyageId, cost, ...fuelEmissions } = voyage;
      Object.entries(fuelEmissions).filter((fe) => fe[1] > 0).forEach((fuel) => {
        if (allFuels.indexOf(fuel[0]) === -1) allFuels.push(fuel[0]);
      });
      return allFuels;
    }, []);

    return {
      labels: fuelChartData.map((voyage) => voyage.voyageId),
      datasets: [
        {
          type: 'line',
          label: 'Cost',
          data: fuelChartData.map((voyage) => parseFloat(voyage.cost)?.toFixed(3)),
          fill: true,
          backgroundColor: 'transparent',
          borderColor: 'red',
          pointRadius: 5,
          pointBackgroundColor: 'red',
          pointBorderColor: 'red',
          pointHoverBackgroundColor: 'red',
          yAxisID: 'y-axis-2',
        },
        ...fuels.map((fuel, index) => ({
          label: FUEL_GRADES.find((f) => f.value.toLowerCase() === fuel)?.label,
          backgroundColor: newColor(index),
          borderColor: newColor(index),
          data: fuelChartData.map((voyage) => parseFloat(voyage[fuel.toLowerCase()])?.toFixed(3)),
          yAxisID: 'y-axis-1',
        }))
      ],
    };
  }, [fuelChartData]);

  const columns = useMemo(
    () => [
      ...(selectedTab === JOURNEY_OPTION.CII ? CII_COLUMNS : []),
      ...(selectedTab === JOURNEY_OPTION.ETS ? ETS_COLUMNS : []),
      {
        title: "Actions",
        key: "actions",
        render: (data) =>
          me?.userRole?.role === SUPER_ADMIN ||
            me?.userRole?.role === COMPANY_EDITOR ? (
              <>
                <Button
                  className={`${classes.action} view`}
                  onClick={() => history.push(`/voyage/${data.id}`)}
                >
                  <EditIcon />
                </Button>
                <Button
                  className={`${classes.action} delete`}
                  onClick={() => handleDelete(data.id)}
                >
                  <DeleteIcon />
                </Button>
              </>
            ) : (
              <Button
                className={`${classes.action} view`}
                onClick={() => history.push(`/voyage/${data.id}`)}
              >
                <VisibilityIcon />
              </Button>
            ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTab]
  );

  useEffect(() => {
    fetchVesselTripsList();
  }, [fetchVesselTripsList]);

  const refetchData = () => {
    fetchVesselTripsList();

    if (selectedTab === JOURNEY_OPTION.CII) {
      getCIIData(filterParams);
    } else if (selectedTab === JOURNEY_OPTION.ETS) {
      getETSData(filterParams);
    }
  }

  const deleteVoyage = useCallback(
    (isDelete) => {
      if (isDelete) {
        removeVesselTrip(deletingVoyage).then(() => refetchData());
      }
      setDeletingVoyage(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deletingVoyage, fetchVesselTripsList]
  );

  const handleChangeSort = (value) => {
    if (value === sortBy) {
      setOrder(order === "DESC" ? "ASC" : "DESC");
    } else {
      setSortBy(value);
      setOrder("ASC");
    }
  };

  const handleFilterByVessel = (e) => {
    const vesselId = e.target.value;
    setVesselId(vesselId);
  };

  const handleFilterByCompany = (e) => {
    const companyId = e.target.value;
    getVessels(companyId);
    setCompany(e.target.value);
  };

  const handleDelete = (id) => {
    setDeletingVoyage(id);
  };

  const handleExport = async (value) => {
    if (value === EXPORT_OPTION.XLS) {
      exportVoyageAsExcel(filterParams).then((res) => {
        download(
          res,
          `Vessel_Voyage_${Date.now()}.xlsx`,
          "application/octet-stream"
        );
      });
    } else if (value === EXPORT_OPTION.PDF) {
      const screenshot = await getScreenShot("cii-screenshot");
      exportVoyageAsPdf(screenshot, filterParams).then((res) => {
        download(res, `Vessel_Voyage_${Date.now()}.pdf`, "application/pdf");
      });
    }
  };

  const handleChangeFiles = (files, parsedResult) => {
    setFiles(files);
    setParsedData(parsedResult)
  };

  const handleDownloadSample = () => {
    getVoyageSample().then((res) => {
      download(res, 'sample_voyage.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  };

  const handleSaveUpload = () => {

    if (Object.keys(parsedData).length === 0) {
      return notify("Please upload a file!", "error");
    }

    const data = parsedData.filter(item => item.voyageId);

    setIsImporting(true);

    createVesselTrips(data)
      .then(() => {
        notify("Created successfully!");
        setFiles([]);
        setParsedData({});
        refetchData();
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, "error");
        }
      })
      .finally(() => {
        setIsImporting(false);
      });
  };
  
  const handleChangeYear = (e) => {
    setYear(e.target.value);
  }
  
  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="title">Voyage</Typography>
      </Box>

      <Box sx={{ marginBottom: "1rem" }}>
        {Object.keys(JOURNEY_OPTION).map((option) => (
          <CommonButton
            key={option}
            variant={option === selectedTab ? "contained" : "text"}
            className={classes.toggle}
            onClick={() => setSelectedTab(option)}
          >
            {option}
          </CommonButton>
        ))}
      </Box>

      <Box className={classes.filterWrapper}>
      {me?.userRole?.role === SUPER_ADMIN && (
          <CommonSelect
            className={classes.filter}
            options={companyFilters}
            optionLabel="name"
            optionValue="id"
            value={companyId}
            onChange={handleFilterByCompany}
          />
        )}

        <CommonSelect
          className={classes.filter}
          options={vesselFilters}
          optionLabel="name"
          optionValue="id"
          value={vesselId}
          onChange={handleFilterByVessel}
        />

        <CommonSelect
          className={classes.filter}
          options={[
            { name: "Select Type", value: "VISIABLE" },
            { name: "Actual", value: "ACTUAL" },
            { name: "Predicted", value: "PREDICTED" },
            { name: "Archived", value: "ARCHIVED" },
          ]}
          optionLabel="name"
          optionValue="value"
          value={voyageType}
          onChange={(e) => setVoyageType(e.target.value)}
        />

        <CommonDatePicker
          className={classes.filter}
          name="fromDate"
          placeholder="Select Date from"
          value={fromDate}
          onChange={setFromDate}
          disabled={year !== 'no_year'}
        />
        <CommonDatePicker
          className={classes.filter}
          name="toDate"
          placeholder="Select Date to"
          value={toDate}
          onChange={setToDate}
          disabled={year !== 'no_year'}
        />
        <CommonSelect
          className={classes.filter}
          options={[{ id: 'no_year', label: 'Select Year' }, ...YEARS_OPTION ]}
          optionLabel="label"
          optionValue="id"
          value={year}
          onChange={handleChangeYear}
        />
        <CommonMenu
          className={classes.exportAs}
          label="Export as"
          items={EXPORT_OPTIONS}
          onChange={handleExport}
        />
        {[SUPER_ADMIN, COMPANY_EDITOR].includes(me?.userRole?.role) && (
          <CommonButton
            className={classes.button}
            onClick={() => history.push("/voyage/create")}
          >
            Create voyage
          </CommonButton>
        )}
      </Box>
      <Grid container item xs={12} md={12} spacing={3} id="cii-screenshot">
        {selectedTab === JOURNEY_OPTION.CII && (
          <>
            <Grid item xs={12} md={6}>
              <LineChart
                title="CII per voyage"
                updatedDate="Update yesterday at 11:59 PM"
                data={ciiChartPerTrip}
                useCategory={true}
                xLabel="Voyage ID"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LineChart
                title="Cumulative CII per voyage"
                updatedDate="Update yesterday at 11:59 PM"
                data={ciiChartPerVoyage}
                useCategory={true}
                xLabel="Voyage ID"
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <MultiaxisChart
                title="Emissions and distance per voyage"
                updatedDate="Update yesterday at 11:59 PM"
                data={stackChartPerVoyage}
                xLabel="Voyage ID"
                y1Label="Emmisions (tns)"
                y2Label="Distance tavelled in NM"
                stack={true}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <MultiaxisChart
                title="Comparison of fuel types and cost"
                updatedDate="Update yesterday at 11:59 PM"
                data={fuelChartPerVoyage}
                xLabel="Voyage ID"
                y1Label="Fuel quantity(tns)"
                y2Label="Fuel cost(euros)"
              />
            </Grid>
            {
              me?.userRole?.role !== VIEWER &&
              <Grid item xs={12} md={12}>
                <Card className={classes.card}>
                  <Dropzone files={files} onExcelParse={(file) => excelVoyageParse(file)} onChangeFiles={handleChangeFiles} />
                  <Box className={classes.fileAction}>
                    <CommonButton
                      color="secondary"
                      onClick={handleDownloadSample}
                    >
                      Download template
                    </CommonButton>
                    <CommonButton disabled={isImporting} onClick={handleSaveUpload}>
                      Save upload
                    </CommonButton>
                  </Box>
                </Card>
              </Grid>
            }
          </>
        )}
        {selectedTab === JOURNEY_OPTION.ETS && (
          <>
            <Grid item xs={12} md={6}>
              <BarChart
                title="Cost per voyage"
                updatedDate="Updated yesterday at 11:59 PM"
                data={costPerVoyage}
                scales={{
                  x: {
                    time: {
                      unit: "month",
                    },
                    gridLines: {
                      display: false,
                    },
                    ticks: {
                      maxTicksLimit: 5,
                    },
                    maxBarThickness: 30,
                    stacked: true,
                    scaleLabel: {
                      display: true,
                      labelString: "Voyage ID"
                    }
                  },
                  y: {
                    ticks: {
                      min: 0,
                    },
                    gridLines: {
                      display: true,
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Cost (€)"
                    }
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LineChart
                title="Cumulative EUA"
                updatedDate="Update yesterday at 11:59 PM"
                data={cumulativeEuaPerVoyage}
                xLabel="Voyage ID"
                yLabel="Cost (€)"
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <LineChart
                title="Relative EUA Cost"
                updatedDate="Update yesterday at 11:59 PM"
                data={percentPerVoyage}
                xLabel="Voyage ID"
              />
            </Grid>
          </>
        )}
      </Grid>
      <Box className={classes.dataTable}>
        <DataTable
          columns={columns}
          isSearchable
          tableData={trips}
          search={search}
          order={order}
          sortBy={sortBy}
          pagination={pagination}
          onChangePage={setPage}
          onChangeLimit={setLimit}
          onChangeSearch={setSearch}
          onChangeSortBy={handleChangeSort}
        />
      </Box>
      {!!deletingVoyage && (
        <Modal open title="Voyage Deletion" handleCloseModal={deleteVoyage}>
          <DeleteMsg className={classes.deleteMsg}>
            Are you sure to delete this voyage?
          </DeleteMsg>
        </Modal>
      )}
    </Root>
  );
};

export default Voyage;
