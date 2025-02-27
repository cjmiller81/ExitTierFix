'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  IconButton,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TierData, Column } from './types';

// Create the columns configuration
const columns: Column[] = [
  { id: 'addTier', label: 'Add Tier', minWidth: 80, align: 'center' },
  { id: 'exitTier', label: 'Exit Tier', minWidth: 80, align: 'center' },
  { id: 'percentPosition', label: '% Position', minWidth: 100, align: 'center' },
  { id: 'exitType', label: 'Exit Type', minWidth: 100, align: 'center' },
  { id: 'optionPftOffset', label: 'Option Pft Offset', minWidth: 120, align: 'center' },
  { id: 'optionStopOffset', label: 'Option Stop Offset', minWidth: 140, align: 'center' },
  { id: 'stockPftOffset', label: 'Stock Pft Offset', minWidth: 120, align: 'center' },
  { id: 'stockStopOffset', label: 'Stock Stop Offset', minWidth: 140, align: 'center' },
  { id: 'removeTier', label: 'Remove Tier', minWidth: 100, align: 'center' },
];

// Default initial row
const defaultInitialRow: TierData = {
  id: 'row-0',
  exitTier: '1',
  percentPosition: '100',
  exitType: 'Limit',
  optionPftOffset: '9',
  optionStopOffset: '--',
  stockPftOffset: '2',
  stockStopOffset: '--',
};

export default function DynamicTable() {
  const theme = useTheme();
  const [rows, setRows] = useState<TierData[]>([defaultInitialRow]);

  // Function to update exit tiers after any change
  const updateExitTiers = (updatedRows: TierData[]) => {
    return updatedRows.map((row, index) => ({
      ...row,
      exitTier: (index + 1).toString()
    }));
  };

  // Function to add a new tier
  const handleAddTier = () => {
    // Calculate total percentage already allocated
    const totalAllocated = rows.reduce((sum, row) => {
      const value = parseFloat(row.percentPosition);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    const remainingPercent = Math.max(0, 100 - totalAllocated);
    
    const newRow: TierData = {
      id: `row-${rows.length}`,
      exitTier: (rows.length + 1).toString(), // Simply use the next row number
      percentPosition: remainingPercent.toString(),
      exitType: 'Limit',
      optionPftOffset: '9',
      optionStopOffset: '--',
      stockPftOffset: '2',
      stockStopOffset: '--',
    };
    
    setRows([...rows, newRow]);
  };

  // Function to remove a tier
  const handleRemoveTier = (id: string) => {
    const rowToRemove = rows.find(row => row.id === id);
    if (!rowToRemove) return;
    
    const removedPercentage = parseFloat(rowToRemove.percentPosition);
    let remainingRows = rows.filter(row => row.id !== id);
    
    // If only the first row will remain, reset it to 100%
    if (remainingRows.length === 1) {
      remainingRows = [{
        ...remainingRows[0],
        percentPosition: '100'
      }];
    } else {
      // Redistribute the removed percentage to the first row
      const firstRow = remainingRows[0];
      const currentFirstRowPercentage = parseFloat(firstRow.percentPosition);
      const newFirstRowPercentage = currentFirstRowPercentage + removedPercentage;
      
      // Update the first row with the new percentage
      remainingRows = remainingRows.map((row, index) => 
        index === 0 
          ? { ...row, percentPosition: newFirstRowPercentage.toString() } 
          : row
      );
    }
    
    // Update exit tiers to be sequential
    setRows(updateExitTiers(remainingRows));
  };

  // Function to handle number change for % Position
  const handleNumberChange = (id: string, field: keyof TierData, value: string) => {
    if (field === 'percentPosition') {
      // Calculate total percentage already allocated excluding this row
      const otherRowsSum = rows.reduce((sum, row) => 
        row.id !== id ? sum + parseFloat(row.percentPosition) : sum, 0);
      
      // Validate the new value to ensure total doesn't exceed 100%
      const numValue = parseFloat(value);
      const maxAllowed = 100 - otherRowsSum;
      const validValue = isNaN(numValue) ? '0' : Math.min(numValue, maxAllowed).toString();
      
      setRows(rows.map(row => {
        if (row.id === id) {
          return { ...row, [field]: validValue };
        }
        return row;
      }));
    } else {
      // Regular number field change
      setRows(
        rows.map(row => {
          if (row.id === id) {
            return { ...row, [field]: value };
          }
          return row;
        })
      );
    }
  };

  // Function to handle exit type change
  const handleExitTypeChange = (id: string, event: SelectChangeEvent<string>) => {
    const exitType = event.target.value;
    setRows(
      rows.map(row => {
        if (row.id === id) {
          // Set default values based on exit type
          if (exitType === 'Limit') {
            return { 
              ...row, 
              exitType, 
              optionStopOffset: '--', 
              stockStopOffset: '--' 
            };
          } else { // OCO type
            return { 
              ...row, 
              exitType, 
              optionStopOffset: '5', 
              stockStopOffset: '1' 
            };
          }
        }
        return row;
      })
    );
  };

  // Function to handle the Add Tier button display logic
  const shouldShowAddTierButton = () => {
    // Calculate total percentage already allocated
    const totalAllocated = rows.reduce((sum, row) => {
      const value = parseFloat(row.percentPosition);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    // Show the button if the total allocated is less than 100
    return Math.round(totalAllocated) < 100;
  };

  // Custom styling for the dark theme
  const styles = {
    card: {
      backgroundColor: '#333',
      borderRadius: 2,
      border: '1px solid #444',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    tableContainer: {
      backgroundColor: 'transparent',
    },
    table: {
      minWidth: 650,
    },
    headerCell: {
      backgroundColor: '#222',
      color: '#fff',
      fontWeight: 'bold',
      border: '1px solid #444',
      padding: '12px 8px',
    },
    tableCell: {
      color: '#ddd',
      border: '1px solid #444',
      padding: '8px',
    },
    numberInput: {
      '& .MuiInputBase-input': {
        color: '#fff',
        textAlign: 'center',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#555',
        },
        '&:hover fieldset': {
          borderColor: '#777',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#4caf50',
        },
      },
    },
    selectInput: {
      '& .MuiInputBase-input': {
        color: '#fff',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#555',
        },
        '&:hover fieldset': {
          borderColor: '#777',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#4caf50',
        },
      },
      '& .MuiSelect-icon': {
        color: '#aaa',
      },
    },
    disabledInput: {
      '& .MuiInputBase-input': {
        color: '#777',
        '-webkit-text-fill-color': '#777',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#444',
        },
      },
    },
    addButton: {
      color: '#4caf50',
      '&:hover': {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
      },
    },
    removeButton: {
      color: '#f44336',
      '&:hover': {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
      },
    },
    staticText: {
      color: '#ddd',
      fontSize: '1rem',
    },
  };

  return (
    <Card sx={styles.card}>
      <TableContainer sx={styles.tableContainer} component={Paper}>
        <Table sx={styles.table} stickyHeader aria-label="dynamic tier table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={styles.headerCell}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow hover tabIndex={-1} key={row.id}>
                {/* Add Tier Button - empty cell for regular rows */}
                <TableCell sx={styles.tableCell} align="center">
                  {/* No add button in regular rows */}
                </TableCell>
                
                {/* Exit Tier - static number */}
                <TableCell sx={styles.tableCell} align="center">
                  <span style={styles.staticText}>{row.exitTier}</span>
                </TableCell>
                
                {/* % Position - number input */}
                <TableCell sx={styles.tableCell} align="center">
                  <TextField
                    value={row.percentPosition}
                    onChange={(e) => handleNumberChange(row.id, 'percentPosition', e.target.value)}
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
                    variant="outlined"
                    size="small"
                    sx={styles.numberInput}
                  />
                </TableCell>
                
                {/* Exit Type - dropdown */}
                <TableCell sx={styles.tableCell} align="center">
                  <FormControl size="small" fullWidth sx={styles.selectInput}>
                    <Select
                      value={row.exitType}
                      onChange={(e) => handleExitTypeChange(row.id, e)}
                      displayEmpty
                    >
                      <MenuItem value="Limit">Limit</MenuItem>
                      <MenuItem value="OCO">OCO</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                
                {/* Option Pft Offset - number input */}
                <TableCell sx={styles.tableCell} align="center">
                  <TextField
                    value={row.optionPftOffset}
                    onChange={(e) => handleNumberChange(row.id, 'optionPftOffset', e.target.value)}
                    type="number"
                    InputProps={{ inputProps: { step: 0.1 } }}
                    variant="outlined"
                    size="small"
                    sx={styles.numberInput}
                  />
                </TableCell>
                
                {/* Option Stop Offset - number input, disabled for Limit */}
                <TableCell sx={styles.tableCell} align="center">
                  {row.exitType === 'Limit' ? (
                    <span style={styles.staticText}>--</span>
                  ) : (
                    <TextField
                      value={row.optionStopOffset === '--' ? '5' : row.optionStopOffset}
                      onChange={(e) => handleNumberChange(row.id, 'optionStopOffset', e.target.value)}
                      type="number"
                      InputProps={{ inputProps: { step: 0.1 } }}
                      variant="outlined"
                      size="small"
                      sx={styles.numberInput}
                    />
                  )}
                </TableCell>
                
                {/* Stock Pft Offset - number input */}
                <TableCell sx={styles.tableCell} align="center">
                  <TextField
                    value={row.stockPftOffset}
                    onChange={(e) => handleNumberChange(row.id, 'stockPftOffset', e.target.value)}
                    type="number"
                    InputProps={{ inputProps: { step: 0.1 } }}
                    variant="outlined"
                    size="small"
                    sx={styles.numberInput}
                  />
                </TableCell>
                
                {/* Stock Stop Offset - number input, disabled for Limit */}
                <TableCell sx={styles.tableCell} align="center">
                  {row.exitType === 'Limit' ? (
                    <span style={styles.staticText}>--</span>
                  ) : (
                    <TextField
                      value={row.stockStopOffset === '--' ? '1' : row.stockStopOffset}
                      onChange={(e) => handleNumberChange(row.id, 'stockStopOffset', e.target.value)}
                      type="number"
                      InputProps={{ inputProps: { step: 0.1 } }}
                      variant="outlined"
                      size="small"
                      sx={styles.numberInput}
                    />
                  )}
                </TableCell>
                
                {/* Remove Tier Button - only for rows after the first */}
                <TableCell sx={styles.tableCell} align="center">
                  {index > 0 && (
                    <IconButton 
                      size="small" 
                      sx={styles.removeButton}
                      onClick={() => handleRemoveTier(row.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          
          {/* Add the "+Add Tier" row that appears when % Position < 100 */}
          {shouldShowAddTierButton() && (
            <TableBody>
              <TableRow hover tabIndex={-1} key="add-tier-row">
                <TableCell sx={{...styles.tableCell, backgroundColor: '#1976d2', padding: '0'}} align="center">
                  <div 
                    style={{
                      color: 'white', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={handleAddTier}
                  >
                    <AddIcon fontSize="small" style={{ marginRight: '4px' }} />
                    Add Tier
                  </div>
                </TableCell>
                <TableCell sx={styles.tableCell} align="center"></TableCell>
                <TableCell sx={styles.tableCell} align="center"></TableCell>
                <TableCell sx={styles.tableCell} align="center"></TableCell>
                <TableCell sx={styles.tableCell} align="center"></TableCell>
                <TableCell sx={styles.tableCell} align="center"></TableCell>
                <TableCell sx={styles.tableCell} align="center"></TableCell>
                <TableCell sx={styles.tableCell} align="center"></TableCell>
                <TableCell sx={styles.tableCell} align="center"></TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Card>
  );
}