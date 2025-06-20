export const patientTypes = {
    A: {
        name: 'A',
        color: 'red'
    },
    B: {
        name: 'B',
        color: 'blue'
    },
    C: {
        name: 'C',
        color: 'green'
    },
    D: {
        name: 'D',
        color: 'yellow'
    },
    E: {
        name: 'E',
        color: 'purple'
    },
    F: {
        name: 'F',
        color: 'orange'
    }
}

export class Patient {
    constructor(type) {
        this.pos = new Vector(0, 0);
        this.type = type;
        this.color = patientTypes[type].color;
        this.name = patientTypes[type].name;
    }

    assignToBed(bed) {
        bed.patient = this;
        this.bed = bed;
        
        this.pos = bed.pos.copy();
    }

    draw(p5, pos = null, opacity = 1) {
        pos = pos || this.pos;
        
        p5.push();
        p5.fill(this.color.x, this.color.y, this.color.z * opacity);
        p5.ellipse(pos.x, pos.y, 10, 10);
        p5.pop();
    }
}