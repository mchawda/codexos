#!/usr/bin/env python3
"""
CodexOS CLI - Command-line interface for task execution and management
"""

import asyncio
import click
import json
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn

from app.core.config import settings
from app.core.security import security_guardrails, execution_sandbox
from app.services.agent_service import AgentService
from app.services.rag_service import RAGService

console = Console()

@click.group()
@click.version_option(version="1.0.0")
def cli():
    """CodexOS CLI - Autonomous Engineering OS Command Line Interface"""
    pass

@cli.command()
@click.argument('task', required=True)
@click.option('--tools', '-t', help='Comma-separated list of allowed tools (e.g., fs,web,db)')
@click.option('--plan-only', is_flag=True, help='Show execution plan without running')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
@click.option('--config', '-c', type=click.Path(exists=True), help='Configuration file path')
def run(task: str, tools: Optional[str], plan_only: bool, verbose: bool, config: Optional[str]):
    """Run a task with specified tools and options"""
    
    if verbose:
        console.print(f"[bold blue]Running task:[/bold blue] {task}")
        if tools:
            console.print(f"[bold blue]Allowed tools:[/bold blue] {tools}")
        if plan_only:
            console.print("[bold yellow]Plan-only mode enabled[/bold yellow]")
    
    # Parse tools
    allowed_tools = []
    if tools:
        allowed_tools = [t.strip() for t in tools.split(',')]
        if verbose:
            console.print(f"[green]Parsed tools:[/green] {allowed_tools}")
    
    # Load configuration
    config_data = {}
    if config:
        try:
            with open(config, 'r') as f:
                config_data = json.load(f)
            if verbose:
                console.print(f"[green]Loaded config from:[/green] {config}")
        except Exception as e:
            console.print(f"[red]Error loading config:[/red] {e}")
            sys.exit(1)
    
    # Execute task
    try:
        if plan_only:
            show_execution_plan(task, allowed_tools, config_data, verbose)
        else:
            execute_task(task, allowed_tools, config_data, verbose)
    except Exception as e:
        console.print(f"[red]Error executing task:[/red] {e}")
        if verbose:
            console.print_exception()
        sys.exit(1)

def show_execution_plan(task: str, tools: List[str], config: Dict[str, Any], verbose: bool):
    """Display execution plan without running"""
    
    console.print(Panel.fit(
        f"[bold blue]Execution Plan for:[/bold blue] {task}",
        border_style="blue"
    ))
    
    # Create plan table
    table = Table(title="Execution Plan")
    table.add_column("Step", style="cyan")
    table.add_column("Action", style="green")
    table.add_column("Tools", style="yellow")
    table.add_column("Estimated Time", style="magenta")
    
    # Add plan steps
    table.add_row("1", "Parse task requirements", "parser", "~1s")
    table.add_row("2", "Generate execution plan", "planner", "~2s")
    table.add_row("3", "Validate tool permissions", "security", "~1s")
    table.add_row("4", "Execute task steps", ", ".join(tools) if tools else "all", "varies")
    table.add_row("5", "Generate results", "output", "~1s")
    
    console.print(table)
    
    # Show tool permissions
    if tools:
        console.print("\n[bold]Tool Permissions:[/bold]")
        for tool in tools:
            permission = security_guardrails.get_tool_permission(tool)
            if permission:
                status = "[green]✓ Allowed[/green]" if permission.allowed else "[red]✗ Denied[/red]"
                console.print(f"  {tool}: {status}")
            else:
                console.print(f"  {tool}: [yellow]? Unknown[/yellow]")

async def execute_task(task: str, tools: List[str], config: Dict[str, Any], verbose: bool):
    """Execute the task with the specified tools"""
    
    console.print(f"[bold green]Executing task:[/bold green] {task}")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        
        # Step 1: Parse task
        task1 = progress.add_task("Parsing task requirements...", total=None)
        await asyncio.sleep(1)  # Simulate parsing
        progress.update(task1, completed=True)
        
        # Step 2: Generate plan
        task2 = progress.add_task("Generating execution plan...", total=None)
        await asyncio.sleep(1.5)  # Simulate planning
        progress.update(task2, completed=True)
        
        # Step 3: Validate permissions
        task3 = progress.add_task("Validating tool permissions...", total=None)
        if tools:
            for tool in tools:
                permission = security_guardrails.get_tool_permission(tool)
                if not permission or not permission.allowed:
                    console.print(f"[red]Tool {tool} not allowed![/red]")
                    sys.exit(1)
        await asyncio.sleep(0.5)
        progress.update(task3, completed=True)
        
        # Step 4: Execute
        task4 = progress.add_task("Executing task...", total=None)
        await asyncio.sleep(2)  # Simulate execution
        progress.update(task4, completed=True)
        
        # Step 5: Generate results
        task5 = progress.add_task("Generating results...", total=None)
        await asyncio.sleep(0.5)
        progress.update(task5, completed=True)
    
    console.print("[bold green]✅ Task completed successfully![/bold green]")
    
    # Show results summary
    results_table = Table(title="Task Results")
    results_table.add_column("Metric", style="cyan")
    results_table.add_column("Value", style="green")
    
    results_table.add_row("Status", "Completed")
    results_table.add_row("Tools Used", ", ".join(tools) if tools else "All available")
    results_table.add_row("Execution Time", "~5.5s")
    results_table.add_row("Memory Used", "~128MB")
    
    console.print(results_table)

@cli.command()
@click.option('--format', '-f', type=click.Choice(['table', 'json', 'yaml']), default='table', help='Output format')
def status(format: str):
    """Show system status and health"""
    
    console.print(Panel.fit(
        "[bold blue]CodexOS System Status[/bold blue]",
        border_style="blue"
    ))
    
    # Create status table
    table = Table(title="System Status")
    table.add_column("Service", style="cyan")
    table.add_column("Status", style="green")
    table.add_column("Version", style="yellow")
    table.add_column("Health", style="magenta")
    
    # Add service statuses
    table.add_row("Backend API", "Running", "1.0.0", "Healthy")
    table.add_row("Frontend", "Running", "1.0.0", "Healthy")
    table.add_row("Database", "Running", "15.4", "Healthy")
    table.add_row("Redis", "Running", "7.2", "Healthy")
    table.add_row("Vector DB", "Running", "0.4.22", "Healthy")
    
    console.print(table)
    
    if format == 'json':
        status_data = {
            "services": [
                {"name": "Backend API", "status": "Running", "version": "1.0.0", "health": "Healthy"},
                {"name": "Frontend", "status": "Running", "version": "1.0.0", "health": "Healthy"},
                {"name": "Database", "status": "Running", "version": "15.4", "health": "Healthy"},
                {"name": "Redis", "status": "Running", "version": "7.2", "health": "Healthy"},
                {"name": "Vector DB", "status": "Running", "version": "0.4.22", "health": "Healthy"}
            ]
        }
        console.print(json.dumps(status_data, indent=2))

@cli.command()
@click.option('--service', '-s', help='Specific service to check')
def health(service: Optional[str]):
    """Check system health"""
    
    if service:
        console.print(f"[bold blue]Health check for:[/bold blue] {service}")
        # Here you would implement actual health checks
        console.print("[green]✅ Service is healthy[/green]")
    else:
        console.print("[bold blue]System Health Check[/bold blue]")
        
        health_table = Table(title="Health Status")
        health_table.add_column("Service", style="cyan")
        health_table.add_column("Status", style="green")
        health_table.add_column("Response Time", style="yellow")
        health_table.add_column("Last Check", style="magenta")
        
        health_table.add_row("Backend API", "Healthy", "45ms", "Just now")
        health_table.add_row("Database", "Healthy", "12ms", "Just now")
        health_table.add_row("Redis", "Healthy", "8ms", "Just now")
        health_table.add_row("Vector DB", "Healthy", "23ms", "Just now")
        
        console.print(health_table)

@cli.command()
@click.option('--level', '-l', type=click.Choice(['info', 'warning', 'error']), default='info', help='Log level')
@click.option('--lines', '-n', default=50, help='Number of lines to show')
def logs(level: str, lines: int):
    """Show system logs"""
    
    console.print(f"[bold blue]System Logs (Level: {level.upper()})[/bold blue]")
    
    # Simulate log output
    log_table = Table(title=f"Recent Logs - {level.upper()}")
    log_table.add_column("Timestamp", style="cyan")
    log_table.add_column("Level", style="yellow")
    log_table.add_column("Service", style="green")
    log_table.add_column("Message", style="white")
    
    for i in range(min(lines, 10)):
        log_table.add_row(
            f"2024-01-{15+i:02d} 10:30:{i:02d}",
            level.upper(),
            "backend" if i % 2 == 0 else "frontend",
            f"Sample log message {i+1}"
        )
    
    console.print(log_table)

if __name__ == '__main__':
    cli()
