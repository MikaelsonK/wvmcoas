"use client";

import React from "react";
import { Form, TextField, Label, Input, Button } from "react-aria-components";

export function RegisterPatientForm() {
  return (
    <Form method="post" action="/api/admin/patients">
      <TextField isRequired name="hrn" className="form-group">
        <Label className="form-label">Patient HRN (Hospital Record Number)</Label>
        <Input className="input-field" placeholder="e.g. HRN-99887" required />
      </TextField>

      <TextField isRequired name="name" className="form-group">
        <Label className="form-label">Full Name</Label>
        <Input className="input-field" placeholder="e.g. Jane Doe" required />
      </TextField>

      <div className="row" style={{ marginBottom: 0 }}>
        <TextField isRequired name="age" className="col form-group">
          <Label className="form-label">Age</Label>
          <Input type="number" min={0} className="input-field" placeholder="32" required />
        </TextField>
        
        <div className="col form-group">
          <label className="form-label" htmlFor="pat-gender">Gender</label>
          <select id="pat-gender" name="gender" className="input-field" required>
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pat-civil">Civil Status</label>
        <select id="pat-civil" name="civilStatus" className="input-field">
          <option value="">Select...</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Separated">Separated</option>
          <option value="Widowed">Widowed</option>
        </select>
      </div>

      <TextField name="email" className="form-group">
        <Label className="form-label">Email Address</Label>
        <Input type="email" className="input-field" placeholder="e.g. jane.doe@example.com" />
      </TextField>

      <Button type="submit" className="button-primary" style={{ width: "100%", marginTop: 12 }}>
        Register Patient
      </Button>
    </Form>
  );
}
