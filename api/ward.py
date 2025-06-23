from problem import Data, Disease

class Ward:
    """
    Exists within the Hospital. 
    Container class for patients.
    Has limited capacity.
    """
    def __init__(self, disease: Disease, bed_capacity:int):
        self.disease            =   disease
        self.urgency_points     =   Data.urgency_points[disease]
        self.bed_capacity       =   bed_capacity

    def initialize(self):
        self.accepted_patients  =   0
        self.rejected_patients  =   0
        self.num_patients       =   0
        self.penalty_points     =   0
    
    def has_space(self):
        return self.num_patients < self.bed_capacity

    def accept_patient(self):
        self.num_patients       += 1
        self.accepted_patients  += 1
    
    def reject_patient(self):
        self.rejected_patients  += 1
        self.penalty_points     += self.urgency_points

    def release_patient(self):
        self.num_patients       -= 1

    def __str__(self):
        return (
            f"Ward for {self.disease.name}:\n"
            f"  Capacity: {self.bed_capacity}\n"
            f"  Current Patients: {self.num_patients}\n"
            f"  Accepted: {self.accepted_patients}, Rejected: {self.rejected_patients}\n"
            f"  Penalty Points: {self.penalty_points} (Urgency per rejection: {self.urgency_points})"
        ) 