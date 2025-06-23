import numpy as np    
from enum import IntEnum


class Disease(IntEnum):
    """
    Static object containing [A, B, C, D, E, F*] types
    Each Ward and Inpatient will have one letter as their type
    """
    A = 0
    B = 1
    C = 2
    D = 3
    E = 4
    F = 5

    def __str__(self):
        return self.name

    def to_dict(self) -> str:
        return self.name

class Data:
    """
    Default values from the problem file.
    """
    transition_matrix = np.array([
        [0.00, 0.05, 0.10, 0.05, 0.80, 0.00],  # From patient A
        [0.20, 0.00, 0.50, 0.15, 0.15, 0.00],  # From patient B
        [0.30, 0.20, 0.00, 0.20, 0.30, 0.00],  # From patient C
        [0.35, 0.30, 0.05, 0.00, 0.30, 0.00],  # From patient D
        [0.20, 0.10, 0.60, 0.10, 0.00, 0.00],  # From patient E
        [0.20, 0.20, 0.20, 0.20, 0.20, 0.00],  # From patient F*
    ])
    bed_distribution = {
        Disease.A: 55,
        Disease.B: 40,
        Disease.C: 30,
        Disease.D: 20,
        Disease.E: 20,
        Disease.F: 0,
    }
    arrival_rates = {
        Disease.A: 14.5,
        Disease.B: 11.0,
        Disease.C: 8.0,
        Disease.D: 6.5,
        Disease.E: 5.0,
        Disease.F: 13.0,
    }
    stay_means = {
        Disease.A: 2.9,
        Disease.B: 4.0,
        Disease.C: 4.5,
        Disease.D: 1.4,
        Disease.E: 3.9,
        Disease.F: 2.2,
    }

    urgency_points = {
        Disease.A: 7.0,
        Disease.B: 5.0,
        Disease.C: 2.0,
        Disease.D: 10.0,
        Disease.E: 5.0,
        Disease.F: 0.0,
    } 