import { State } from './state';
import { RunDataObject, projectDataObject, Job, ProjectObject, Run } from '@/types/dataTypes';
import { Serie } from '@/types/graphTypes';

export default {
  setRuns (state: State, runs: RunDataObject[]) {
    if (!state.runsLoaded) {
      state.runsLoaded = true
    }
    state.runs = runs
  },
  setProjects (state: State, projects: projectDataObject[]) {
    if (!state.projectsLoaded) {
      state.projectsLoaded = true
    }
    state.projects = projects
  },
  setJobs (state: State, jobs: Job[]) {
    if (!state.jobsLoaded) {
      state.jobsLoaded = true
    }
    state.jobs = jobs
  },
  setPipelineData(state: State, statistics: Serie[]) {
    state.statistics = statistics
  },
  setMachineRuntimes(state: State, series: Record<string, Serie[]>) {
    state.machineRuntimes = series
  },
  setMachineSampleCounts(state: State, sampleCounts: Record<string, number[]>) {
    state.machineSampleCounts = sampleCounts
  },
  setSequencerStatisticsSeries(state: State, series: number[]) {
    state.sequencerStatisticsSeries = series
  },
  setSequencerStatisticsLabels(state: State, labels: string[]) {
    state.sequencerStatisticsLabels = labels
  },
  setTotalCounts(state: State, counts: number) {
    state.totalSampleCounts = counts
  },
  setYearlySampleCounts(state: State, counts: number) {
    state.yearlySampleCounts = counts
  },
  setMonthlySampleCounts(state: State, counts: number) {
    state.monthlySampleCounts = counts
  },
  setWeeklySampleCounts(state: State, counts: number) {
    state.weeklySampleCounts = counts
  },
  setDailySampleCounts(state: State, counts: number) {
    state.dailySampleCounts = counts
  },
  setSequnecedSampleNumbers(state: State, data: {labels: string[], counts: number[]}){
    state.sequencedSampleNumbers = {
      labels: data.labels,
      counts: data.counts
    }
  },
  updateCommentOnLocalProject(state: State, {projectName , comment}: {projectName: string, comment: string}) {
    const index = state.projects.findIndex(project => project.project === projectName)
    state.projects[index].comment = comment
  },
  setRunObjects(state: State, Runs: Run[]) {
    state.runObjects = Runs
  },
  setProjectObjects(state: State, projects: Record<string, ProjectObject[]>) {
    state.projectObjects = projects
  },
  updateFinishedRuns(state: State, finished: string[]) {
    state.runObjects.forEach((run: Run, index: number) => {
      if (run.run_id in finished) {
        state.runObjects[index].setFinished()
      }
    })
    state.rawDataConverted = true
  }
}