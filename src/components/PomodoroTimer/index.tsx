import React, { useCallback, useEffect, useState } from 'react';
import { useInterval } from '../../hooks/useInterval';
import { secondsToTime } from '../../utils/functions/secondsToTime';
import { Button } from '../Button';
import { Timer } from '../Timer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bellStart = require('../../sounds/src_sounds_bell-start.mp3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bellFinish = require('../../sounds/src_sounds_bell-finish.mp3');

const audioStartWorking = new Audio(bellStart);
const audioFinishWorking = new Audio(bellFinish);

interface Props {
  pomodoroTime: number;
  shortRestTime: number;
  longRestTime: number;
  cycles: number;
}

export function PomodoroTimer(props: Props): JSX.Element {
  const [mainTime, setMainTime] = useState(props.pomodoroTime);
  const [timeCounting, setTimeCounting] = useState(false);
  const [working, setWorking] = useState(false);
  const [resting, setResting] = useState(false);
  const [cyclesQttManager, setCyclesQttManager] = useState(
    new Array(props.cycles - 1).fill(true),
  );
  const [completedCycles, setCompletedCycles] = useState(0);
  const [fullWorkingTime, setFullWorkingTime] = useState(0);
  const [numberOfPomodoros, setNumberOfPomodoros] = useState(0);

  const configureWork = useCallback(() => {
    setTimeCounting(true);
    setWorking(true);
    setResting(false);
    setMainTime(props.pomodoroTime);
    audioStartWorking.play();
  }, [props.pomodoroTime]);

  const configureRest = useCallback(
    (long: boolean) => {
      setTimeCounting(true);
      setWorking(false);
      setResting(true);
      long ? setMainTime(props.longRestTime) : setMainTime(props.shortRestTime);
      audioFinishWorking.play();
    },
    [props.longRestTime, props.shortRestTime],
  );

  useEffect(() => {
    working && document.body.classList.add('working');
    resting && document.body.classList.remove('working');
    if (mainTime > 0) return;

    if (working && cyclesQttManager.length > 0) {
      configureRest(false);
      cyclesQttManager.pop();
    } else {
      configureRest(true);
      setCyclesQttManager(new Array(props.cycles - 1).fill(true));
      setCompletedCycles(completedCycles + 1);
    }

    working && setNumberOfPomodoros(numberOfPomodoros + 1);
    resting && configureWork();
  }, [
    completedCycles,
    configureRest,
    configureWork,
    cyclesQttManager,
    mainTime,
    numberOfPomodoros,
    props.cycles,
    resting,
    working,
  ]);

  useInterval(
    () => {
      setMainTime(mainTime - 1);
      working && setFullWorkingTime(fullWorkingTime + 1);
    },
    timeCounting ? 1000 : null,
  );

  return (
    <div className="pomodoro">
      <h2>Você está {working ? 'trabalhando' : 'descansando'}</h2>
      <Timer mainTime={mainTime} />

      <div className="controls">
        <Button text="Work" onClick={() => configureWork()} />
        <Button text="Rest" onClick={() => configureRest(false)} />
        <Button
          className={!working && !resting ? 'hidden' : ''}
          text={timeCounting ? 'Pause' : 'Play'}
          onClick={() => setTimeCounting(!timeCounting)}
        />
      </div>

      <div className="details">
        <p>Ciclos concluídos: {completedCycles}</p>
        <p>Horas trabalhadas: {secondsToTime(fullWorkingTime)}</p>
        <p>Pomodoros concluídos: {numberOfPomodoros}</p>
      </div>
    </div>
  );
}
