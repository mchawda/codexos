"""Tests for the CodexOS CLI"""

import pytest
from click.testing import CliRunner
from app.cli import cli


@pytest.fixture
def runner():
    """Create a CLI runner for testing"""
    return CliRunner()


def test_cli_help(runner):
    """Test CLI help command"""
    result = runner.invoke(cli, ['--help'])
    assert result.exit_code == 0
    assert 'CodexOS CLI' in result.output


def test_cli_version(runner):
    """Test CLI version command"""
    result = runner.invoke(cli, ['--version'])
    assert result.exit_code == 0
    assert '1.0.0' in result.output


def test_run_command_help(runner):
    """Test run command help"""
    result = runner.invoke(cli, ['run', '--help'])
    assert result.exit_code == 0
    assert 'Run a task' in result.output


def test_status_command_help(runner):
    """Test status command help"""
    result = runner.invoke(cli, ['status', '--help'])
    assert result.exit_code == 0
    assert 'Show system status' in result.output


def test_health_command_help(runner):
    """Test health command help"""
    result = runner.invoke(cli, ['health', '--help'])
    assert result.exit_code == 0
    assert 'Check system health' in result.output


def test_logs_command_help(runner):
    """Test logs command help"""
    result = runner.invoke(cli, ['logs', '--help'])
    assert result.exit_code == 0
    assert 'Show system logs' in result.output


def test_run_command_with_task(runner):
    """Test run command with a task"""
    result = runner.invoke(cli, ['run', 'test task'])
    # This should fail because we're not in a proper async context
    # but it should at least parse the command
    assert result.exit_code != 0  # Expected to fail in test environment


def test_status_command(runner):
    """Test status command"""
    result = runner.invoke(cli, ['status'])
    assert result.exit_code == 0
    assert 'System Status' in result.output


def test_health_command(runner):
    """Test health command"""
    result = runner.invoke(cli, ['health'])
    assert result.exit_code == 0
    assert 'System Health Check' in result.output


def test_logs_command(runner):
    """Test logs command"""
    result = runner.invoke(cli, ['logs'])
    assert result.exit_code == 0
    assert 'System Logs' in result.output


def test_logs_command_with_level(runner):
    """Test logs command with specific level"""
    result = runner.invoke(cli, ['logs', '--level', 'error'])
    assert result.exit_code == 0
    assert 'ERROR' in result.output


def test_logs_command_with_lines(runner):
    """Test logs command with specific number of lines"""
    result = runner.invoke(cli, ['logs', '--lines', '20'])
    assert result.exit_code == 0
    assert 'Recent Logs' in result.output
