import { differenceInSeconds } from 'date-fns'
import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from 'react'

import {
  addNewCycleAction,
  interruptCurrentCycleAction,
  markCurrentCycleAsFinishedAction,
} from '../reducers/cycles/actions'
import { Cycle, cyclesReducer } from '../reducers/cycles/reducer'

interface CycleFormData {
  task: string
  minutesAmount: number
}

interface CycleContextType {
  cycles: Cycle[]
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  setSecondsPassed: (sec: number) => void
  setCurrentCycleAsFinished: () => void
  interruptCurrentCycle: () => void
  createNewCycle: (data: CycleFormData) => void
}

interface CycleContextProviderProps {
  children: ReactNode
}

export const CycleContext = createContext({} as CycleContextType)

export const CycleContextProvider = ({
  children,
}: CycleContextProviderProps) => {
  const [cyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    () => {
      const storageCycleStateJSON = localStorage.getItem(
        '@focus:cycle-state/v1.0.0',
      )

      if (storageCycleStateJSON) {
        return JSON.parse(storageCycleStateJSON)
      }
      return {
        cycles: [],
        activeCycleId: null,
      }
    },
  )

  const { cycles, activeCycleId } = cyclesState
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if (activeCycle) {
      return differenceInSeconds(new Date(), new Date(activeCycle.startDate))
    }

    return 0
  })

  useEffect(() => {
    const cycleStateJSON = JSON.stringify(cyclesState)

    localStorage.setItem('@focus:cycle-state/v1.0.0', cycleStateJSON)
  }, [cyclesState])

  const createNewCycle = (data: CycleFormData) => {
    const id = String(new Date().getTime())

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    dispatch(addNewCycleAction(newCycle))

    setAmountSecondsPassed(0)
  }

  const interruptCurrentCycle = () => {
    dispatch(interruptCurrentCycleAction())
  }

  const setSecondsPassed = (seconds: number) => {
    setAmountSecondsPassed(seconds)
  }

  const setCurrentCycleAsFinished = () => {
    dispatch(markCurrentCycleAsFinishedAction())
  }

  return (
    <CycleContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        setSecondsPassed,
        setCurrentCycleAsFinished,
        amountSecondsPassed,
        createNewCycle,
        interruptCurrentCycle,
      }}
    >
      {children}
    </CycleContext.Provider>
  )
}
