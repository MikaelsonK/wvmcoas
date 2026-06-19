"use client";

import React from "react";
import { Form, TextField, Label, Input, Button } from "react-aria-components";

export function RegisterResidentForm() {
  return (
    <Form method="post" action="/api/admin/residents">
      <TextField isRequired name="name" className="form-group">
        <Label className="form-label">Full Name</Label>
        <Input className="input-field" placeholder="e.g. Dr. Galahad Vance" required />
      </TextField>

      <TextField isRequired type="email" name="email" className="form-group">
        <Label className="form-label">Email Address</Label>
        <Input className="input-field" placeholder="e.g. galahad@hospital.com" required />
      </TextField>

      <div className="row" style={{ marginBottom: 0 }}>
        <TextField isRequired name="yearLevel" className="col form-group">
          <Label className="form-label">Year Level</Label>
          <Input type="number" min={1} max={10} className="input-field" placeholder="1" required />
        </TextField>
        
        <TextField name="contactNo" className="col form-group">
          <Label className="form-label">Contact No.</Label>
          <Input className="input-field" placeholder="+63917..." />
        </TextField>
      </div>

      <TextField isRequired type="password" name="password" className="form-group">
        <Label className="form-label">Temporary Password</Label>
        <Input minLength={6} className="input-field" placeholder="••••••••" required />
      </TextField>

      <Button type="submit" className="button-primary" style={{ width: "100%", marginTop: 12 }}>
        Add Resident
      </Button>
    </Form>
  );
}
