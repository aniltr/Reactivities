import {} from "semantic-ui-react/dist/commonjs/elements/Icon";
import React, { Fragment, useContext, useEffect } from "react";
import { Container } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import ActivityStore from '../stores/activityStore';
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import LoadingComponent from "./LoadingComponent";
import NavBar from "../../features/nav/NavBar";

const App = () => {
  const activityStore = useContext(ActivityStore);

  useEffect(() => {
    activityStore.loadActivities();
  }, [activityStore]);
  
  if (activityStore.loadingInitial) return <LoadingComponent content="Loading activities..." />;

  return (
    <Fragment>
      <NavBar />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashboard />
      </Container>
    </Fragment>
  );
};

export default observer(App);
