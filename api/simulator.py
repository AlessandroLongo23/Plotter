import heapq
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Tuple, Optional, Any

import numpy as np

from hospital import Hospital
from problem import Disease


class EventType(Enum):
    ARRIVAL = 1
    DEPARTURE = 2

    def __str__(self):
        return self.name.capitalize()


@dataclass(order=True)
class Event:
    time: float
    event_type: EventType
    patient_id: int
    patient_disease: Disease

    def __str__(self):
        return f"{self.event_type}, {self.time}, {self.patient_id}, {self.patient_disease}"

    def to_dict(self) -> Dict[str, Any]:
        return {
            'time': self.time,
            'event_type': str(self.event_type),
            'patient_id': self.patient_id,
            'patient_disease': self.patient_disease.to_dict()
        }

EventHistory = List[Tuple[Event, Optional[Disease]]]


class Simulator:
    def __init__(self, hospital: Hospital, arrival_rates: dict[Disease, float], stay_means: dict[Disease, float]):
        self.hospital           = hospital
        self.arrival_rate       = arrival_rates
        self.stay_means         = stay_means

    def init(self):
        self._clock                 = 0
        self._patient_counter       = 0
        self._event_queue           = []
        self._event_history         = []
        self.hospital.initialize()

    def run(self, time=365.0, log=False, export=False) -> Optional[EventHistory]:
        self.init()

        try:
            self._run_simulation_loop(time)
            return self._event_history
        except Exception as e:
            print(f"Exception occurred: {e}")
            return None

    def _run_simulation_loop(self, time):
        for disease in Disease:
            self._create_arrival(disease)

        while self._clock <= time and len(self._event_queue) > 0:
            event = heapq.heappop(self._event_queue)
            self._clock = event.time

            if event.event_type == EventType.ARRIVAL:
                allocation = self._handle_arrival(event)
            elif event.event_type == EventType.DEPARTURE:
                allocation = self._handle_departure(event)
            else:
                raise Exception(f"Unexpected Event: {event}")

            self._event_history.append((event, allocation))

    def _create_arrival(self, disease: Disease):
        time = self._clock + np.random.exponential(1.0 / self.arrival_rate[disease])
        arrival = Event(time, EventType.ARRIVAL, self._patient_counter, disease)
        self._patient_counter += 1
        heapq.heappush(self._event_queue, arrival)

    def _create_departure(self, patient_id: int, patient_disease: Disease):
        time = self._clock + np.random.exponential(self.stay_means[patient_disease])
        departure = Event(time, EventType.DEPARTURE, patient_id, patient_disease)
        heapq.heappush(self._event_queue, departure)

    def _handle_arrival(self, arrival: Event) -> Optional[Disease]:
        result = self.hospital.enter_patient(arrival.patient_id, arrival.patient_disease)
        if result is not None:
            self._create_departure(arrival.patient_id, arrival.patient_disease)
        self._create_arrival(arrival.patient_disease)
        return result

    def _handle_departure(self, departure: Event) -> Disease:
        return self.hospital.release_patient(departure.patient_id) 