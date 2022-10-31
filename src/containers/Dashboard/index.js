import React, { useEffect, useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";

import {
  DASHBOARD_PAGES,
  EXPORT_OPTION,
  EXPORT_OPTIONS,
  YEARS_OPTION,
} from "../../constants/Global";
import { SUPER_ADMIN } from "../../constants/UserRoles";
import { useCompany } from "../../context/company.context";
import { useAuth } from "../../context/auth.context";
import { download } from "../../utils/download";
import CompanyDetailPopper from "../../components/Widgets/CompanyDetailPopper";
// import CommonSelect from "../../components/Forms/CommonSelect";
import CommonMenu from "../../components/Forms/CommonMenu";
import DashboardCII from "./CII";
import DashboardEuEts from "./EuEts";
import DashboardEuGhg from "./EuGhg";
import { getScreenShot } from "../../utils/exportAsPdf";
import { useVessel } from "../../context/vessel.context";

const PREFIX = "Dashboard";
const classes = {
  root: `${PREFIX}-root`,
  titleWrapper: `${PREFIX}-title-wrapper`,
  title: `${PREFIX}-title`,
  menu: `${PREFIX}-menu`,
  content: `${PREFIX}-content`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.titleWrapper}`]: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1.5rem",
    "& .MuiTypography-title": {
      marginRight: "1rem",
    },
  },
  [`& .${classes.title}`]: {
    display: "flex",
    alignItems: "center",
  },
  [`& .${classes.menu}`]: {
    marginRight: "0.5rem",
  },
  [`& .${classes.content}`]: {
    marginTop: "1.5rem",
  },
}));

const Dashboard = () => {
  const { me } = useAuth();
  const isSuperAdmin = me?.userRole?.role === SUPER_ADMIN;
  const {
    companies,
    getCompanies,
    exportVesselsCIIAsExcel,
    exportVesselsEtsAsExcel,
    exportVesselsGhgAsExcel,
    exportVesselsCIIAsPdf,
    exportVesselsEtsAsPdf,
    exportVesselsGhgAsPdf,
    filterParams,
  } = useCompany();
  const {
    vesselTypes,
    getVesselTypes
  } = useVessel();
  const location = useLocation();

  const [company, setCompany] = useState();
  const [vesselType, setVesselType] = useState();
  const [vesselTypesList, setVesselTypesList] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  /*const [type, setType] = useState("VISIABLE");
  const [voyageType, setVoyageType] = useState(["PREDICTED", "ACTUAL"]);*/

  useEffect(() => {
    if (companies && isSuperAdmin) {
      setCompany(companies[0]?.id);
    } else if (me?.company?.id) {
      setCompany(me?.company?.id);
    }
  }, [isSuperAdmin, me?.company?.id, companies]);

  useEffect(() => {
    if (isSuperAdmin) {
      getCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  useEffect(() => {
    setVesselTypesList(vesselTypes.map(v => ({label: v.name, id: v.id})));

    if (vesselTypes.length > 0) {
      const v = vesselTypes[0];
      setVesselType(v.id);
    } else {
      getVesselTypes()
    }
  }, [vesselTypes])

  const currentPage = useMemo(() => {
    const paths = location.pathname.split("/");
    return paths[paths.length - 1];
  }, [location]);

  const handleSelectCompany = (value) => {
    setCompany(value);
  };

  const handleExport = async (value) => {
    if (value === EXPORT_OPTION.XLS) {
      if (currentPage === DASHBOARD_PAGES.CII) {
        exportVesselsCIIAsExcel(company, filterParams).then((res) => {
          download(
            res,
            `Vessel_CII_${Date.now()}.xlsx`,
            "application/octet-stream"
          );
        });
      } else if (currentPage === DASHBOARD_PAGES.ETS) {
        exportVesselsEtsAsExcel(company, filterParams).then((res) => {
          download(
            res,
            `Vessel_ETS_${Date.now()}.xlsx`,
            "application/octet-stream"
          );
        });
      } else if (currentPage === DASHBOARD_PAGES.GHG) {
        exportVesselsGhgAsExcel(company, filterParams).then((res) => {
          download(
            res,
            `Vessel_GHG_${Date.now()}.xlsx`,
            "application/octet-stream"
          );
        });
      }
    } else if (value === EXPORT_OPTION.PDF) {
      const screenshot = await getScreenShot("converting-pdf");
      if (currentPage === DASHBOARD_PAGES.CII) {
        exportVesselsCIIAsPdf(company, filterParams, screenshot).then((res) => {
          download(res, `Vessel_CII_${Date.now()}.pdf`, "application/pdf");
        });
      } else if (currentPage === DASHBOARD_PAGES.ETS) {
        exportVesselsEtsAsPdf(company, filterParams, screenshot).then((res) => {
          download(res, `Vessel_ETS_${Date.now()}.pdf`, "application/pdf");
        });
      } else if (currentPage === DASHBOARD_PAGES.GHG) {
        exportVesselsGhgAsPdf(company, filterParams, screenshot).then((res) => {
          download(res, `Vessel_GHG_${Date.now()}.pdf`, "application/pdf");
        });
      }
    }
  };

  /*
  const changeType = (type) => {
    setVoyageType(type === "VISIABLE"
      ? ["PREDICTED", "ACTUAL"]
      : [voyageType]
    )
    setType(type)
  }*/

  return (
    <Root className={classes.root}>
      <Box className={classes.titleWrapper}>
        <Box className={classes.title}>
          <Typography variant="title">
            {isSuperAdmin
              ? companies?.find((item) => item.id === company)?.name
              : me?.company?.name}
          </Typography>
          <CompanyDetailPopper
            company={
              isSuperAdmin
                ? companies?.find((item) => item.id === company)
                : me.company
            }
          />
        </Box>
        <Box>
          {/* <CommonSelect
            className={classes.menu}
            options={[
              { name: "Select Type", value: "VISIABLE" },
              { name: "Actual", value: "ACTUAL" },
              { name: "Predicted", value: "PREDICTED" },
              { name: "Archived", value: "ARCHIVED" },
            ]}
            optionLabel="name"
            optionValue="value"
            value={type}
            onChange={(e) => changeType(e.target.value)}
          />*/}
          <CommonMenu
            className={classes.menu}
            label={vesselTypesList?.find((vList) => vList.id === vesselType)?.label}
            items={vesselTypesList}
            onChange={(value) => setVesselType(value)}
          />
          <CommonMenu
            className={classes.menu}
            label={`Year - ${selectedYear}`}
            items={YEARS_OPTION}
            onChange={(value) => setSelectedYear(value)}
          />
          {isSuperAdmin && (
            <CommonMenu
              className={classes.menu}
              items={companies}
              optionLabel="name"
              onChange={handleSelectCompany}
              label={companies?.find((item) => item.id === company)?.name}
            />
          )}
          <CommonMenu
            label="Export as"
            items={EXPORT_OPTIONS}
            onChange={handleExport}
          />
        </Box>
      </Box>
      <Box className={classes.content}>
        <Switch>
          <Route
            exact
            path="/dashboard"
            render={() => <Redirect to="dashboard/cii" />}
          />
          <Route
            exact
            path="/dashboard/cii"
            render={() => (
              <DashboardCII
                thisYear={selectedYear}
                //  type={voyageType}
                type={vesselTypesList.find((v) => v.id === vesselType)?.label}
                company={company}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/eu-ets"
            render={() => (
              <DashboardEuEts
                thisYear={selectedYear}
                //type={voyageType}
                company={company}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/eu-ghgs"
            render={() => (
              <DashboardEuGhg thisYear={selectedYear} company={company} />
            )}
          />
        </Switch>
      </Box>
    </Root>
  );
};

export default Dashboard;
