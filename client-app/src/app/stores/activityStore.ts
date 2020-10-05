import { IActivity } from "../models/activity";
import { action, observable, computed, configure, runInAction } from "mobx";
import { createContext, SyntheticEvent } from "react";
import agent from "../api/agent";

configure({enforceActions: 'always'});

class ActivityStore {
  @observable activityRegistry = new Map();
  @observable activities: IActivity[] = [];
  @observable selectedActivity: IActivity | undefined;
  @observable editMode: boolean = false;
  @observable loadingInitial = false;
  @observable submitting = false;
  @observable target ='';

  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(b.date) - Date.parse(a.date)
    );
  }

  @action loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      runInAction('loading activities', () => {
        activities.forEach((activity) => {
          activity.date = activity.date.split(".")[0];
          this.activityRegistry.set(activity.id, activity);
        });
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction ('end of loading activities', () => {
        this.loadingInitial = false;
      })
    }
  };

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.selectActivity(activity.id);
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('end of creating activity', () => {
        this.submitting = false;
        this.editMode = false;
      })
    }
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try{
      await agent.Activities.update(activity);
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.selectActivity(activity.id);
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('end of editing activity', () => {
        this.editMode = false;
        this.submitting = false;
      })
    }
  }

  @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>,id: string) => {
    this.target = event.currentTarget.name;
    this.submitting = true;
    try {
      await agent.Activities.delete(id);
      runInAction('deleting activity', () => {
        this.activityRegistry.delete(id);        
      })
    } catch(error) {
      console.log(error);
    } finally {
      runInAction('end of deleting activity', () => {
        this.submitting = false;
        this.target = '';
      })
    }
  }

  @action openCreateForm = () => {
    this.editMode = true;
    this.selectedActivity = undefined;
  };

  @action openEditForm = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode = true;
  }

  @action cancelEditForm = () => {
    this.selectActivity(undefined);
    this.editMode = false;
  }

  @action cancelFormOpen = () => {
    this.editMode = false;
  }

  @action selectActivity = (id: string | undefined) => {
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode = false;
  };
}

export default createContext(new ActivityStore());
