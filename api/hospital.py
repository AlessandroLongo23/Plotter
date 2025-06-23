from problem import Disease
from ward import Ward
import numpy as np
from typing import Optional


class Hospital:
    """
    Container class for wards.
    """
    def __init__(self, bed_distribution:dict[Disease, int], relocation_matrix: Optional[np.ndarray] = None):
        self.wards                          = {disease: Ward(disease, bed_distribution[disease]) for disease in Disease}
        self.relocation_matrix              = relocation_matrix

    def initialize(self):
        self.lost_patients                  = 0
        self.allocation: dict[int, Ward]    = {}
        for ward in self.wards.values():
            ward.initialize()


    def enter_patient(self, id: int, disease: Disease) -> Optional[Disease]:
        if self.wards[disease].has_space():
            self.wards[disease].accept_patient()
            self.allocation[id] = self.wards[disease]
            return disease
        elif self.relocation_matrix is not None:
            self.wards[disease].reject_patient()
            return self.relocate_patient(id, disease)
        else:
            self.wards[disease].reject_patient()
            self.lost_patients += 1
            return None

        
    def relocate_patient(self, id: int, disease: Disease) -> Optional[Disease]:
        if self.relocation_matrix is None:
            raise Exception("Attempted to relocate patient, but no relocation matrix provided.")

        probs = self.relocation_matrix[disease]
        relocation = Disease(np.random.choice(list(Disease), p=probs))

        if self.wards[relocation].has_space():
            self.wards[relocation].accept_patient()
            self.allocation[id] = self.wards[relocation]
            return relocation
        else:
            self.wards[relocation].reject_patient()
            self.lost_patients += 1
            return None
        

    def release_patient(self, id: int) -> Disease:
        ward = self.allocation[id]
        ward.release_patient()
        return ward.disease
        

    def __str__(self):
        ward_summaries = "\n".join(
            f"\t{line}" for ward in self.wards.values() for line in str(ward).splitlines()
        )
        return (
            f"Hospital Status:\n"
            f"{ward_summaries}\n"
            f"Lost Patients: {self.lost_patients}"
        ) 